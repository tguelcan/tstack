import { getRequestEvent } from '$app/server';
import { invalid, isHttpError, isRedirect } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth, type Session, type SessionUser } from './auth';
import { prisma } from './db';

/**
 * Authorization for remote functions.
 *
 * This is the only place that decides who may do what. `hooks.server.ts` also
 * redirects signed-out visitors, but that is a convenience for page navigations
 * and nothing more: remote requests never reach the hook, and the header it
 * would have to route on comes from the client. So every remote function starts
 * with one of the calls below, and nothing in `src/lib/remotes` touches `prisma`
 * without having done so — `guard.spec.ts` checks that mechanically.
 */

/** Headers of the current request — every `auth.api.*` call wants these. */
export function requestHeaders(): Headers {
	return getRequestEvent().request.headers;
}

/** The active session, or `null`. Never throws. */
export async function getSession(): Promise<Session | null> {
	const { request } = getRequestEvent();

	return auth.api.getSession({ headers: request.headers });
}

/** A signed-in user, or a redirect to the login form. */
export async function requireUser(): Promise<SessionUser> {
	const session = await getSession();
	if (!session) redirect(303, '/login');

	return session.user;
}

export type OrgContext = {
	user: SessionUser;
	organizationId: string;
	/** `owner`, `admin`, `member`, or whatever a custom role is called. */
	role: string;
};

/**
 * A signed-in user *and* the organization they are working in.
 *
 * The membership is read from the database rather than taken from the session,
 * so being removed from an organization takes effect on the next request instead
 * of whenever the session happens to be refreshed.
 *
 * Anything that cannot be resolved ends up on `/onboarding`, which knows how to
 * deal with all three reasons for landing there: no organization yet, an
 * invitation waiting, or an active organization that no longer exists.
 */
export async function requireOrg(): Promise<OrgContext> {
	const session = await getSession();
	if (!session) redirect(303, '/login');

	const organizationId = session.session.activeOrganizationId;
	if (!organizationId) redirect(303, '/onboarding');

	const membership = await prisma.member.findUnique({
		where: { organizationId_userId: { organizationId, userId: session.user.id } },
		select: { role: true }
	});
	if (!membership) redirect(303, '/onboarding');

	return { user: session.user, organizationId, role: membership.role };
}

/**
 * Guards an action behind the organization's access control, e.g.
 * `requirePermission({ organization: ['update'] })` for the settings form.
 *
 * The roles are Better Auth's defaults: an owner may do everything, an admin
 * everything but delete the organization, a member may read.
 */
export async function requirePermission(
	permissions: Record<string, string[]>
): Promise<OrgContext> {
	const context = await requireOrg();
	const { request } = getRequestEvent();

	const { success } = await auth.api.hasPermission({
		headers: request.headers,
		body: { permissions }
	});

	if (!success) invalid('You do not have permission to do that.');

	return context;
}

/**
 * Messages we phrase ourselves, because Better Auth's wording either leaks more
 * than it should or reads like an API response. Everything else is passed
 * through — those messages are already written for people.
 */
const MESSAGES: Record<string, string> = {
	// Never name which half was wrong: that turns the login form into a way to
	// find out who has an account here.
	INVALID_EMAIL_OR_PASSWORD: 'Email or password is incorrect.',
	USER_ALREADY_EXISTS: 'That email address is already taken.',
	EMAIL_NOT_VERIFIED: 'Confirm your email address before signing in.',
	INVALID_TOKEN: 'This link is no longer valid. Request a new one.',
	TOKEN_EXPIRED: 'This link has expired. Request a new one.',
	SESSION_EXPIRED: 'Your session is too old for this. Sign in again and retry.',
	ORGANIZATION_ALREADY_EXISTS: 'An organization with that address already exists.',
	SLUG_IS_TAKEN: 'That address is already taken.'
};

/** The `code` Better Auth attaches to an `APIError`, if there is one. */
function codeOf(error: APIError): string | undefined {
	const body = error.body as { code?: string } | undefined;

	return body?.code;
}

/**
 * Whether a thrown value is a Better Auth error with this exact code — for the
 * handful of cases that deserve their own path rather than a message under the
 * form, e.g. sending an unverified sign-in attempt to `/verify-email`.
 */
export function isAuthError(thrown: unknown, code: string): boolean {
	return thrown instanceof APIError && codeOf(thrown) === code;
}

/**
 * Turns whatever a Better Auth call threw into a form error.
 *
 * Redirects and `error()` responses are control flow and have to keep flying;
 * only a genuine `APIError` becomes a message under the form. Anything else is
 * re-thrown, so a bug surfaces as a bug instead of as "something went wrong".
 */
export function fail(thrown: unknown, fallback: string): never {
	if (isRedirect(thrown) || isHttpError(thrown)) throw thrown;

	if (thrown instanceof APIError) {
		const code = codeOf(thrown);
		invalid((code && MESSAGES[code]) || thrown.message || fallback);
	}

	throw thrown;
}
