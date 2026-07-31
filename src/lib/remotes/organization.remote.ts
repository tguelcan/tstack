import { form, query } from '$app/server';
import { invalid, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { slugify } from '$helper/format';
import { auth } from '$server/auth';
import { prisma } from '$server/db';
import { fail, requestHeaders, requireOrg, requirePermission, requireUser } from '$server/guard';
import { emailSchema } from '$server/schemas';
import { deleteImage, storeImageField } from '$server/upload';

/**
 * Organizations, members and invitations.
 *
 * Reads go through Prisma, because the pages need a little more than Better
 * Auth's endpoints return — a member row without the person's name is not a
 * member list. Writes go through `auth.api.*`, so the plugin's own rules apply:
 * who may change a role, when an invitation expires, what happens to the
 * membership rows when an organization is deleted.
 */

const nameSchema = z
	.string()
	.trim()
	.min(1, 'Please enter a name')
	.max(80, 'Use 80 characters or fewer');

const slugSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(2, 'Use at least 2 characters')
	.max(48, 'Use 48 characters or fewer')
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, digits and single hyphens');

/**
 * An empty file input still submits — SvelteKit drops those before validation,
 * so an absent value here really does mean "no file chosen".
 */
const imageSchema = z.instanceof(File).optional();

/** Roles that can be handed out. `owner` is not among them on purpose. */
const roleSchema = z.enum(['admin', 'member']);

/** Both the picker in the sidebar and the organization form show these. */
const organizationFields = { id: true, name: true, slug: true, logo: true } as const;

/**
 * Everything the app shell needs in one round trip: who you are, which
 * organization you are in, and which others you could switch to.
 */
export const getWorkspace = query(async () => {
	const { user, organizationId, role } = await requireOrg();

	const [organization, memberships] = await Promise.all([
		prisma.organization.findUnique({ where: { id: organizationId }, select: organizationFields }),
		prisma.member.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'asc' },
			select: { organization: { select: organizationFields } }
		})
	]);

	// The organization was deleted between the guard and this query. Onboarding
	// knows what to do with that.
	if (!organization) redirect(303, '/onboarding');

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image ?? null,
			bio: user.bio ?? null,
			timezone: user.timezone ?? null
		},
		organization,
		organizations: memberships.map((membership) => membership.organization),
		role
	};
});

/** Organizations you already belong to. May be empty — that is the point. */
export const getMyOrganizations = query(async () => {
	const user = await requireUser();

	const memberships = await prisma.member.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'asc' },
		select: { role: true, organization: { select: organizationFields } }
	});

	return memberships.map(({ role, organization }) => ({ ...organization, role }));
});

/** Invitations waiting for the signed-in address. Drives the onboarding page. */
export const getMyInvitations = query(async () => {
	const user = await requireUser();

	return prisma.invitation.findMany({
		where: { email: user.email, status: 'pending', expiresAt: { gt: new Date() } },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			role: true,
			expiresAt: true,
			organization: { select: organizationFields },
			inviter: { select: { name: true, email: true } }
		}
	});
});

/**
 * One invitation by id, for the link in the email.
 *
 * Returns `null` for anything that is not addressed to the signed-in user —
 * expired, already used, or simply somebody else's. A guessed id has to look
 * exactly like a stale one.
 */
export const getInvitation = query(z.string().min(1), async (id) => {
	const user = await requireUser();

	const invitation = await prisma.invitation.findUnique({
		where: { id },
		select: {
			id: true,
			email: true,
			role: true,
			status: true,
			expiresAt: true,
			organization: { select: organizationFields },
			inviter: { select: { name: true, email: true } }
		}
	});

	if (!invitation) return null;
	if (invitation.email.toLowerCase() !== user.email.toLowerCase()) return null;

	return invitation;
});

/** The member list, plus the invitations that have not been answered yet. */
export const getMembers = query(async () => {
	const { organizationId } = await requireOrg();

	const [members, invitations] = await Promise.all([
		prisma.member.findMany({
			where: { organizationId },
			orderBy: { createdAt: 'asc' },
			select: {
				id: true,
				role: true,
				createdAt: true,
				user: { select: { id: true, name: true, email: true, image: true, bio: true } }
			}
		}),
		prisma.invitation.findMany({
			where: { organizationId, status: 'pending', expiresAt: { gt: new Date() } },
			orderBy: { createdAt: 'desc' },
			select: { id: true, email: true, role: true, expiresAt: true }
		})
	]);

	return { members, invitations };
});

export const createOrganization = form(
	z.object({ name: nameSchema, slug: slugSchema.optional(), logo: imageSchema }),
	async ({ name, slug, logo }, issue) => {
		await requireUser();

		// The browser fills the slug field while you type the name; this covers the
		// no-JavaScript path and names that slugify to nothing, like `Тест`.
		const address = slug || slugify(name) || `org-${crypto.randomUUID().slice(0, 8)}`;

		const stored = await storeImageField(logo, 'logo', (message) => invalid(issue.logo(message)));

		try {
			const organization = await auth.api.createOrganization({
				headers: requestHeaders(),
				body: { name, slug: address, logo: stored }
			});

			// `createOrganization` makes the new one active, but only when the caller
			// did not ask otherwise — saying so explicitly keeps this independent of
			// that default.
			if (organization) {
				await auth.api.setActiveOrganization({
					headers: requestHeaders(),
					body: { organizationId: organization.id }
				});
			}
		} catch (error) {
			// Nothing references the file yet, so it would sit on the volume forever.
			await deleteImage(stored);

			if (error instanceof Error && /slug/i.test(error.message)) {
				invalid(issue.slug('That address is already taken'));
			}

			fail(error, 'Could not create the organization.');
		}

		redirect(303, '/dashboard');
	}
);

export const switchOrganization = form(
	z.object({ organizationId: z.string().min(1) }),
	async ({ organizationId }) => {
		const user = await requireUser();

		// Better Auth checks this too. Doing it here as well means an unauthorised
		// id reads as "no such organization" rather than as an error page.
		const membership = await prisma.member.findUnique({
			where: { organizationId_userId: { organizationId, userId: user.id } },
			select: { id: true }
		});
		if (!membership) redirect(303, '/onboarding');

		await auth.api.setActiveOrganization({ headers: requestHeaders(), body: { organizationId } });

		redirect(303, '/dashboard');
	}
);

export const updateOrganization = form(
	z.object({
		name: nameSchema,
		slug: slugSchema,
		logo: imageSchema,
		removeLogo: z.boolean().default(false)
	}),
	async ({ name, slug, logo, removeLogo }, issue) => {
		const { organizationId } = await requirePermission({ organization: ['update'] });

		const current = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { logo: true }
		});

		const stored = await storeImageField(logo, 'logo', (message) => invalid(issue.logo(message)));
		// A new file wins over the remove checkbox; `null` clears the column.
		const next = stored ?? (removeLogo ? null : undefined);

		try {
			await auth.api.updateOrganization({
				headers: requestHeaders(),
				body: { organizationId, data: { name, slug, ...(next !== undefined && { logo: next }) } }
			});
		} catch (error) {
			await deleteImage(stored);

			if (error instanceof Error && /slug/i.test(error.message)) {
				invalid(issue.slug('That address is already taken'));
			}

			fail(error, 'Could not save the organization.');
		}

		// Only once the new value is safely stored — otherwise a failed save would
		// leave a row pointing at a file that is no longer there.
		if (next !== undefined) await deleteImage(current?.logo);
	}
);

export const deleteOrganization = form(
	z.object({ confirmation: z.string() }),
	async ({ confirmation }, issue) => {
		const { organizationId } = await requirePermission({ organization: ['delete'] });

		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { slug: true, logo: true }
		});
		if (!organization) redirect(303, '/onboarding');

		// The browser disables the button until this matches, but that check only
		// exists in the browser — which is why it is repeated here.
		if (confirmation.trim().toLowerCase() !== organization.slug) {
			invalid(issue.confirmation('That does not match the address of this organization'));
		}

		try {
			await auth.api.deleteOrganization({ headers: requestHeaders(), body: { organizationId } });
		} catch (error) {
			fail(error, 'Could not delete the organization.');
		}

		await deleteImage(organization.logo);

		redirect(303, '/onboarding');
	}
);

export const inviteMember = form(
	z.object({ email: emailSchema, role: roleSchema }),
	async ({ email, role }) => {
		const { organizationId } = await requirePermission({ invitation: ['create'] });

		try {
			await auth.api.createInvitation({
				headers: requestHeaders(),
				body: { email, role, organizationId, resend: true }
			});
		} catch (error) {
			fail(error, 'Could not send that invitation.');
		}
	}
);

export const cancelInvitation = form(
	z.object({ invitationId: z.string().min(1) }),
	async ({ invitationId }) => {
		await requirePermission({ invitation: ['cancel'] });

		try {
			await auth.api.cancelInvitation({ headers: requestHeaders(), body: { invitationId } });
		} catch (error) {
			fail(error, 'Could not withdraw that invitation.');
		}
	}
);

export const updateMemberRole = form(
	z.object({ memberId: z.string().min(1), role: roleSchema }),
	async ({ memberId, role }) => {
		const { organizationId } = await requirePermission({ member: ['update'] });

		try {
			await auth.api.updateMemberRole({
				headers: requestHeaders(),
				body: { memberId, role, organizationId }
			});
		} catch (error) {
			fail(error, 'Could not change that role.');
		}
	}
);

export const removeMember = form(
	z.object({ memberId: z.string().min(1) }),
	async ({ memberId }) => {
		const { organizationId } = await requirePermission({ member: ['delete'] });

		try {
			await auth.api.removeMember({
				headers: requestHeaders(),
				body: { memberIdOrEmail: memberId, organizationId }
			});
		} catch (error) {
			fail(error, 'Could not remove that member.');
		}
	}
);

export const leaveOrganization = form('unchecked', async () => {
	const { organizationId } = await requireOrg();

	try {
		await auth.api.leaveOrganization({ headers: requestHeaders(), body: { organizationId } });
	} catch (error) {
		// The last owner cannot walk out and leave the organization without one.
		fail(error, 'Could not leave this organization.');
	}

	// The session still points at an organization this user is no longer part of.
	await auth.api.setActiveOrganization({
		headers: requestHeaders(),
		body: { organizationId: null }
	});

	redirect(303, '/onboarding');
});

export const acceptInvitation = form(
	z.object({ invitationId: z.string().min(1) }),
	async ({ invitationId }) => {
		await requireUser();

		let organizationId: string | undefined;

		try {
			const result = await auth.api.acceptInvitation({
				headers: requestHeaders(),
				body: { invitationId }
			});
			organizationId = result?.invitation.organizationId;
		} catch (error) {
			fail(error, 'That invitation could not be accepted.');
		}

		// Before any redirect: the membership row has to exist, or the guard sends
		// the newly joined member straight back to onboarding to create their own
		// organization — which is precisely what they were trying to avoid.
		if (organizationId) {
			await auth.api.setActiveOrganization({ headers: requestHeaders(), body: { organizationId } });
		}

		redirect(303, '/dashboard');
	}
);

export const rejectInvitation = form(
	z.object({ invitationId: z.string().min(1) }),
	async ({ invitationId }) => {
		await requireUser();

		try {
			await auth.api.rejectInvitation({ headers: requestHeaders(), body: { invitationId } });
		} catch (error) {
			fail(error, 'That invitation could not be declined.');
		}

		redirect(303, '/onboarding');
	}
);
