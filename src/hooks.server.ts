import { redirect, type Handle } from '@sveltejs/kit';
import { auth } from '$server/auth';
import { prisma } from '$server/db';

/**
 * Session lookup and page-level redirects.
 *
 * This hook is convenience, not security. Remote requests are handed straight
 * to `resolve` — for `query` calls SvelteKit never resolves a route at all, and
 * for the rest the pathname a guard would branch on arrives in a header the
 * client controls. Authorization therefore lives in `$server/guard`, which every
 * remote function calls. What is left here is the part that makes the app
 * pleasant: a signed-out visitor lands on the login form rather than on an
 * error, and comes back to the page they wanted.
 *
 * `event.isRemoteRequest` is derived from the URL prefix on the server and
 * cannot be forged, unlike the pathname header.
 */

/** Signed in, or you get sent to the login form. */
const needsUser = (id: string) => id.startsWith('/(app)') || id.startsWith('/(onboarding)');

/** Signed in *and* working in an organization. */
const needsOrganization = (id: string) => id.startsWith('/(app)');

/** Pointless once you are signed in. */
const forGuests = (id: string) => id.startsWith('/(auth)');

export const handle: Handle = async ({ event, resolve }) => {
	if (event.isRemoteRequest) return resolve(event);

	const session = await auth.api.getSession({ headers: event.request.headers });

	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;

	const route = event.route.id ?? '';

	if (!session) {
		if (needsUser(route)) {
			// Carry the destination along, so signing in finishes the navigation the
			// visitor started rather than dropping them on the dashboard.
			const target = event.url.pathname + event.url.search;
			redirect(303, `/login?redirectTo=${encodeURIComponent(target)}`);
		}

		return resolve(event);
	}

	if (forGuests(route)) redirect(303, '/dashboard');

	if (needsOrganization(route) && !session.session.activeOrganizationId) {
		// A session can lose its active organization — the first one was created in
		// another tab, or an invitation was just accepted. Repair it here rather
		// than sending someone who *does* belong somewhere through onboarding.
		const membership = await prisma.member.findFirst({
			where: { userId: session.user.id },
			orderBy: { createdAt: 'asc' },
			select: { organizationId: true }
		});

		if (!membership) redirect(303, '/onboarding');

		await auth.api.setActiveOrganization({
			headers: event.request.headers,
			body: { organizationId: membership.organizationId }
		});
	}

	return resolve(event);
};
