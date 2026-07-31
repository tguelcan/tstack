import { form, query } from '$app/server';
import { invalid, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$server/auth';
import { prisma } from '$server/db';
import { fail, requestHeaders, requireUser } from '$server/guard';
import { emailSchema, passwordSchema, personNameSchema } from '$server/schemas';
import { deleteImage, storeImageField } from '$server/upload';

/**
 * The account: profile, sign-in methods, sessions, notification preferences.
 *
 * Everything Better Auth owns goes through `auth.api.*`, so its own rules apply
 * — a fresh session for listing devices, a mail before an account is deleted.
 * The notification switches are ours and live in a table of the same name.
 */

/** Who you are, how you sign in, and what you have switched on. */
export const getAccount = query(async () => {
	const user = await requireUser();

	const [accounts, notifications] = await Promise.all([
		auth.api.listUserAccounts({ headers: requestHeaders() }),
		prisma.notificationSettings.findUnique({ where: { userId: user.id } })
	]);

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			emailVerified: user.emailVerified,
			image: user.image ?? null,
			bio: user.bio ?? null,
			timezone: user.timezone ?? null
		},
		// `credential` is the email-and-password entry rather than a linked
		// provider; the security page asks a different question for each.
		providers: accounts.filter((account) => account.providerId !== 'credential'),
		hasPassword: accounts.some((account) => account.providerId === 'credential'),
		// Absent means "nothing changed yet", so the defaults from the schema apply.
		notifications: notifications ?? {
			mentions: true,
			assignments: true,
			weeklyDigest: false,
			productUpdates: true,
			desktop: false
		}
	};
});

/** Devices with an open session, current one first. */
export const getSessions = query(async () => {
	await requireUser();
	const { session } = (await auth.api.getSession({ headers: requestHeaders() })) ?? {};

	// Requires a fresh session — Better Auth will not list devices for a token
	// that has been lying around for a day.
	const sessions = await auth.api.listSessions({ headers: requestHeaders() });

	return sessions
		.map((entry) => ({
			token: entry.token,
			createdAt: entry.createdAt,
			ipAddress: entry.ipAddress ?? null,
			userAgent: entry.userAgent ?? null,
			current: entry.token === session?.token
		}))
		.sort((a, b) => Number(b.current) - Number(a.current));
});

export const updateProfile = form(
	z.object({
		name: personNameSchema,
		bio: z.string().trim().max(280, 'Use 280 characters or fewer').optional(),
		// The browser offers a list, but the value arrives as a string either way.
		timezone: z.string().trim().max(64).optional()
	}),
	async ({ name, bio, timezone }) => {
		await requireUser();

		try {
			await auth.api.updateUser({
				headers: requestHeaders(),
				// Empty means "cleared", and the column is nullable.
				body: { name, bio: bio || null, timezone: timezone || null }
			});
		} catch (error) {
			fail(error, 'Could not save your profile.');
		}
	}
);

export const uploadAvatar = form(
	z.object({ image: z.instanceof(File) }),
	async ({ image }, issue) => {
		const user = await requireUser();

		const stored = await storeImageField(image, 'avatar', (message) =>
			invalid(issue.image(message))
		);

		try {
			await auth.api.updateUser({ headers: requestHeaders(), body: { image: stored } });
		} catch (error) {
			await deleteImage(stored);
			fail(error, 'Could not save your photo.');
		}

		// Only after the new one is stored — a failed save must not leave the
		// profile pointing at a file that is already gone.
		await deleteImage(user.image);
	}
);

export const removeAvatar = form('unchecked', async () => {
	const user = await requireUser();

	try {
		await auth.api.updateUser({ headers: requestHeaders(), body: { image: null } });
	} catch (error) {
		fail(error, 'Could not remove your photo.');
	}

	// A social login writes the provider's URL here; `deleteImage` knows to leave
	// anything that is not ours alone.
	await deleteImage(user.image);
});

export const changeEmail = form(z.object({ newEmail: emailSchema }), async ({ newEmail }) => {
	const user = await requireUser();

	if (newEmail.toLowerCase() === user.email.toLowerCase()) {
		invalid('That is already your address.');
	}

	try {
		await auth.api.changeEmail({
			headers: requestHeaders(),
			body: { newEmail, callbackURL: '/profile' }
		});
	} catch (error) {
		fail(error, 'Could not start the address change.');
	}

	redirect(303, '/profile?email-sent=1');
});

export const changePassword = form(
	z
		.object({
			_current: z.string().min(1, 'Please enter your current password'),
			_password: passwordSchema,
			_confirmation: z.string(),
			revokeOthers: z.boolean().default(true)
		})
		.refine((data) => data._password === data._confirmation, {
			message: 'The two passwords do not match',
			path: ['_confirmation']
		}),
	async ({ _current, _password, revokeOthers }) => {
		await requireUser();

		try {
			await auth.api.changePassword({
				headers: requestHeaders(),
				body: {
					currentPassword: _current,
					newPassword: _password,
					revokeOtherSessions: revokeOthers
				}
			});
		} catch (error) {
			fail(error, 'That did not work. Check your current password.');
		}
	}
);

export const revokeSession = form(z.object({ token: z.string().min(1) }), async ({ token }) => {
	await requireUser();

	try {
		// Better Auth resolves the token against the signed-in user, so somebody
		// else's token is not revocable from here.
		await auth.api.revokeSession({ headers: requestHeaders(), body: { token } });
	} catch (error) {
		fail(error, 'Could not sign that device out.');
	}
});

export const revokeOtherSessions = form('unchecked', async () => {
	await requireUser();

	try {
		await auth.api.revokeOtherSessions({ headers: requestHeaders() });
	} catch (error) {
		fail(error, 'Could not sign the other devices out.');
	}
});

export const unlinkAccount = form(
	z.object({ providerId: z.string().min(1) }),
	async ({ providerId }) => {
		await requireUser();

		try {
			// Better Auth refuses when it would be the last way in, which is what
			// stops someone from locking themselves out of their own account.
			await auth.api.unlinkAccount({ headers: requestHeaders(), body: { providerId } });
		} catch (error) {
			fail(error, 'Could not disconnect that account.');
		}
	}
);

export const deleteAccount = form(
	z.object({ confirmation: z.string() }),
	async ({ confirmation }, issue) => {
		const user = await requireUser();

		// The dialog keeps its button disabled until this matches, but that check
		// only exists in the browser — which is exactly why it is repeated here.
		if (confirmation.trim().toLowerCase() !== user.email.toLowerCase()) {
			invalid(issue.confirmation('That does not match your email address'));
		}

		try {
			// Sends a confirmation mail rather than deleting outright: it cannot be
			// undone, and it has to work for accounts that only ever signed in with
			// Google and have no password to ask for.
			await auth.api.deleteUser({ headers: requestHeaders(), body: {} });
		} catch (error) {
			fail(error, 'Could not start deleting your account.');
		}

		redirect(303, '/profile?delete-sent=1');
	}
);

export const updateNotificationSettings = form(
	z.object({
		mentions: z.boolean().default(false),
		assignments: z.boolean().default(false),
		weeklyDigest: z.boolean().default(false),
		productUpdates: z.boolean().default(false),
		desktop: z.boolean().default(false)
	}),
	async (settings) => {
		const user = await requireUser();

		await prisma.notificationSettings.upsert({
			where: { userId: user.id },
			create: { userId: user.id, ...settings },
			update: settings
		});
	}
);
