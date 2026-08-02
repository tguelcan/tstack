import { dev } from '$app/env';
import { getRequestEvent } from '$app/server';
import {
	BETTER_AUTH_SECRET,
	BETTER_AUTH_URL,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$app/env/private';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { config } from './config';
import { prisma } from './db';
import { sendMail } from './mail';

/**
 * The Better Auth instance — the only thing in this app that writes to `user`,
 * `session`, `account`, `verification`, `organization`, `member` and `invitation`.
 *
 * Everything here is called from the server. The Better Auth *client* is
 * deliberately unused: `auth.api.*` from inside a remote `form` function keeps
 * sign-in, sign-up and sign-out working without JavaScript, which is the rule
 * the rest of this app already follows. The `sveltekitCookies` plugin is what
 * makes that possible — it replays the `Set-Cookie` headers Better Auth produces
 * through `event.cookies`, and it has to stay last in the plugin list.
 *
 * What is a decision lives in `config.json`; what is a secret lives in the
 * environment. The pairing of the two is checked once, here, at startup.
 */

/** Reads a credential that `config.json` has declared necessary. */
function credential(provider: string, name: string, value: string): string {
	if (!value) {
		throw new Error(
			`${name} is not set, but \`auth.socialProviders.${provider}\` is on in config.json — ` +
				`add the credential to your environment or switch the provider off.`
		);
	}

	return value;
}

function socialProviders(): BetterAuthOptions['socialProviders'] {
	const enabled = config.auth.socialProviders;
	const providers: NonNullable<BetterAuthOptions['socialProviders']> = {};

	if (enabled.google) {
		providers.google = {
			clientId: credential('google', 'GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID),
			clientSecret: credential('google', 'GOOGLE_CLIENT_SECRET', GOOGLE_CLIENT_SECRET),
			// Without this, a signed-in Google user is taken straight through and
			// never gets the chance to pick a different account.
			prompt: 'select_account'
		};
	}

	if (enabled.github) {
		providers.github = {
			clientId: credential('github', 'GITHUB_CLIENT_ID', GITHUB_CLIENT_ID),
			clientSecret: credential('github', 'GITHUB_CLIENT_SECRET', GITHUB_CLIENT_SECRET)
		};
	}

	return providers;
}

/**
 * Better Auth builds the verification, reset and change-email links from
 * `baseURL`. Without it they come out as paths relative to `/api/auth`, and
 * anything that then makes them absolute produces a link to the wrong route —
 * `/verify-email` instead of `/api/auth/verify-email`. The mail arrives, the
 * button is there, and the token is never seen. So: refuse to start in
 * production, and say the quiet part out loud in development.
 */
function baseUrl(): string | undefined {
	if (BETTER_AUTH_URL) return BETTER_AUTH_URL.replace(/\/+$/, '');

	if (!dev) {
		throw new Error(
			'BETTER_AUTH_URL is not set. Without it the links in verification and ' +
				'invitation emails point at the wrong route. Set it to the public origin ' +
				'of this deployment, e.g. https://app.example.com'
		);
	}

	console.warn(
		'[auth] BETTER_AUTH_URL is not set — links in emails will point at the wrong ' +
			'route. Set it in `.env` to the origin the dev server is listening on.'
	);

	return undefined;
}

const origin = baseUrl();

export const auth = betterAuth({
	appName: config.app.name,
	secret: BETTER_AUTH_SECRET,
	...(origin ? { baseURL: origin, trustedOrigins: [origin] } : {}),

	database: prismaAdapter(prisma, {
		provider: 'postgresql',
		// Off by default. Accepting an invitation writes to `invitation` and
		// `member` in one go, and a half-finished join is worse than a failed one.
		transaction: true
	}),

	emailAndPassword: {
		enabled: config.auth.emailAndPassword.enabled,
		minPasswordLength: config.auth.emailAndPassword.minPasswordLength,
		requireEmailVerification: config.auth.emailAndPassword.requireEmailVerification,
		// A new password should not leave old sessions running.
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			void sendMail({
				to: user.email,
				subject: 'Reset your password',
				heading: 'Reset your password',
				lines: [
					`Someone asked to reset the password for ${user.email}.`,
					'If that was not you, ignore this message — nothing has changed.'
				],
				action: { label: 'Choose a new password', url },
				note: 'This link can only be used once and expires in an hour.'
			});
		}
	},

	emailVerification: {
		sendOnSignUp: true,
		// Verifying is the last step of signing up, so it should end in a session
		// rather than dropping the visitor back at the login form.
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			void sendMail({
				to: user.email,
				subject: `Confirm your email for ${config.app.name}`,
				heading: 'Confirm your email address',
				lines: [
					`Welcome to ${config.app.name}. One click and your account is ready.`,
					'Until then you cannot sign in.'
				],
				action: { label: 'Confirm my email', url }
			});
		}
	},

	socialProviders: socialProviders(),

	account: {
		accountLinking: {
			// Without this, signing in with Google after having registered with the
			// same address by password creates a second, separate account — and the
			// visitor lands in an empty app wondering where their organization went.
			enabled: true,
			trustedProviders: ['google', 'github']
		}
	},

	user: {
		additionalFields: {
			// Carried on the session, so the profile page and the member list do not
			// each need their own query for two short strings.
			bio: { type: 'string', required: false },
			timezone: { type: 'string', required: false }
		},
		changeEmail: {
			enabled: true,
			sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
				void sendMail({
					// Deliberately to the *current* address: the point is that whoever
					// controls the account today gets to approve the move.
					to: user.email,
					subject: 'Approve your new email address',
					heading: 'Approve your new email address',
					lines: [
						`A request was made to change this account's address to ${newEmail}.`,
						'If that was not you, ignore this message and consider changing your password.'
					],
					action: { label: 'Approve the change', url }
				});
			}
		},
		deleteUser: {
			enabled: true,
			// Deletion goes through the inbox rather than through a password prompt.
			// It is irreversible, and it has to work for accounts that only ever
			// signed in with Google and have no password to ask for.
			sendDeleteAccountVerification: async ({ user, url }) => {
				void sendMail({
					to: user.email,
					subject: 'Confirm deleting your account',
					heading: 'Confirm deleting your account',
					lines: [
						'This removes your account and everything only you own. It cannot be undone.',
						'If you did not ask for this, ignore this message — nothing will happen.'
					],
					action: { label: 'Delete my account', url },
					note: 'This link expires in an hour.'
				});
			}
		}
	},

	session: {
		expiresIn: config.auth.session.expiresIn,
		updateAge: config.auth.session.updateAge,
		freshAge: config.auth.session.freshAge
	},

	/**
	 * Rate limiting counts per IP. Behind a proxy that terminates TLS the socket
	 * address is the proxy's, so without this every visitor shares a single
	 * bucket — which is exactly what Better Auth warns about at startup. See
	 * `ipAddressHeaders` in `config.json` for why that list stays deliberate.
	 */
	...(config.auth.ipAddressHeaders.length
		? { advanced: { ipAddress: { ipAddressHeaders: config.auth.ipAddressHeaders } } }
		: {}),

	databaseHooks: {
		session: {
			create: {
				/**
				 * Every session starts with `activeOrganizationId: null`, and a lot of
				 * the organization API answers `NO_ACTIVE_ORGANIZATION` in that state.
				 * Picking the oldest membership means signing in lands where you left
				 * off instead of on an error.
				 */
				before: async (session) => {
					const membership = await prisma.member.findFirst({
						where: { userId: session.userId },
						orderBy: { createdAt: 'asc' },
						select: { organizationId: true }
					});

					return { data: { ...session, activeOrganizationId: membership?.organizationId } };
				}
			}
		}
	},

	plugins: [
		organization({
			allowUserToCreateOrganization: config.auth.organization.allowUserToCreateOrganization,
			creatorRole: config.auth.organization.creatorRole,
			invitationExpiresIn: config.auth.organization.invitationExpiresIn,
			membershipLimit: config.auth.organization.membershipLimit,
			// Re-inviting should replace the pending invitation, not add a second one.
			cancelPendingInvitationsOnReInvite: true,
			// Set on purpose rather than left to be inferred: an invitation id travels
			// in a URL, and this is what stops a guessed one from being accepted by
			// someone who never received the mail.
			requireEmailVerificationOnInvitation: true,
			sendInvitationEmail: async (data) => {
				void sendMail({
					to: data.email,
					subject: `${data.inviter.user.name} invited you to ${data.organization.name}`,
					heading: `Join ${data.organization.name}`,
					lines: [
						`${data.inviter.user.name} (${data.inviter.user.email}) invited you to work together in ${data.organization.name} on ${config.app.name}.`
					],
					action: {
						label: 'Accept the invitation',
						// Relative on purpose: `sendMail` is the one place that knows how
						// to turn a path into an address an inbox can click.
						url: `/accept-invitation/${data.id}`
					},
					note: 'If you were not expecting this, you can ignore the message.'
				});
			}
		}),
		// Has to stay last: it reads the response headers every other plugin has
		// finished writing. Better Auth warns at runtime when it is not.
		sveltekitCookies(getRequestEvent)
	]
});

/** The session shape the rest of the app sees, including our extra user fields. */
export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session['user'];
