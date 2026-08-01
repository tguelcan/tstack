import { form, query } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { internalPath } from '$helper/form';
import { auth } from '$server/auth';
import { config } from '$server/config';
import { fail, isAuthError, requestHeaders, getSession } from '$server/guard';
import { emailSchema, passwordSchema, personNameSchema } from '$server/schemas';

/**
 * The auth flows, running against Better Auth on the server.
 *
 * Every one of these is a remote `form`, so the pages under `(auth)` keep
 * working without JavaScript — including "Continue with Google", which is a form
 * POST ending in a redirect rather than a client-side SDK call. Cookies are
 * written by the `sveltekitCookies` plugin registered in `$server/auth`.
 *
 * Password fields are named with a leading underscore. That is SvelteKit's
 * marker for "do not send this value back to the client" — without it a failed
 * submit would return the password inside the re-rendered HTML.
 */

/** Where to go after signing in. Comes from the client, so it is filtered. */
const redirectToSchema = z.string().max(500).optional();

/** Which social buttons to render. Reads the same switches as `$server/auth`. */
export const getAuthProviders = query(async () =>
	(['google', 'github'] as const).filter((provider) => config.auth.socialProviders[provider])
);

/**
 * Whether anybody is signed in — nothing more.
 *
 * The public header uses it to point at the dashboard instead of the login
 * form. Deliberately a boolean rather than the session: this runs on pages any
 * visitor can reach, and a name or an email has no business travelling there.
 * `getSession` never throws, so this is safe to await outside a boundary.
 */
export const getIsSignedIn = query(async () => !!(await getSession()));

export const login = form(
	z.object({
		email: emailSchema,
		_password: z.string().min(1, 'Please enter your password'),
		// A checkbox sends nothing when it is unchecked.
		remember: z.boolean().default(false),
		redirectTo: redirectToSchema
	}),
	async ({ email, _password, remember, redirectTo }) => {
		try {
			await auth.api.signInEmail({
				headers: requestHeaders(),
				body: { email, password: _password, rememberMe: remember }
			});
		} catch (error) {
			// An unverified account is not a typo in the form — it is a step the
			// visitor still has to take, so send them where they can take it.
			if (isAuthError(error, 'EMAIL_NOT_VERIFIED')) redirect(303, '/verify-email');

			fail(error, 'Email or password is incorrect.');
		}

		redirect(303, internalPath(redirectTo, '/dashboard'));
	}
);

export const register = form(
	z.object({
		name: personNameSchema,
		email: emailSchema,
		_password: passwordSchema,
		terms: z
			.boolean()
			.default(false)
			.refine((accepted) => accepted, 'Please accept the terms to continue')
	}),
	async ({ name, email, _password }) => {
		try {
			await auth.api.signUpEmail({
				headers: requestHeaders(),
				body: { name, email, password: _password, callbackURL: '/dashboard' }
			});
		} catch (error) {
			fail(error, 'That did not work. Please try again.');
		}

		// With verification required there is no session yet, and the answer is the
		// same whether or not the address was already taken — which is the point.
		// Without it, signing up signs you in and the next stop is onboarding.
		redirect(
			303,
			config.auth.emailAndPassword.requireEmailVerification ? '/verify-email' : '/onboarding'
		);
	}
);

export const resendVerification = form(z.object({ email: emailSchema }), async ({ email }) => {
	try {
		await auth.api.sendVerificationEmail({
			headers: requestHeaders(),
			body: { email, callbackURL: '/dashboard' }
		});
	} catch {
		// Swallowed on purpose: a different answer for an unknown address would
		// turn this form into a way to check who has an account here.
	}

	redirect(303, '/verify-email?sent=1');
});

export const requestPasswordReset = form(z.object({ email: emailSchema }), async ({ email }) => {
	try {
		await auth.api.requestPasswordReset({
			headers: requestHeaders(),
			body: { email, redirectTo: '/reset-password' }
		});
	} catch {
		// Same reasoning as above — the redirect below is unconditional.
	}

	redirect(303, '/forgot-password?sent=1');
});

export const resetPassword = form(
	z
		.object({
			token: z.string().min(1, 'This reset link is incomplete'),
			_password: passwordSchema,
			_confirmation: z.string()
		})
		.refine((data) => data._password === data._confirmation, {
			message: 'The two passwords do not match',
			path: ['_confirmation']
		}),
	async ({ token, _password }) => {
		try {
			await auth.api.resetPassword({
				headers: requestHeaders(),
				body: { token, newPassword: _password }
			});
		} catch (error) {
			fail(error, 'This link is no longer valid. Request a new one.');
		}

		redirect(303, '/login?reset=1');
	}
);

export const signInWithProvider = form(
	z.object({
		provider: z.enum(['google', 'github']),
		redirectTo: redirectToSchema
	}),
	async ({ provider, redirectTo }) => {
		if (!config.auth.socialProviders[provider]) redirect(303, '/login');

		let url: string | undefined;

		try {
			({ url } = await auth.api.signInSocial({
				headers: requestHeaders(),
				body: {
					provider,
					callbackURL: internalPath(redirectTo, '/dashboard'),
					errorCallbackURL: '/login'
				}
			}));
		} catch (error) {
			fail(error, `Could not reach ${provider}. Please try again.`);
		}

		// `url` is only absent on the id-token branch, which a form post never takes.
		redirect(303, url ?? '/login');
	}
);

// No fields to validate, so no schema — `'unchecked'` is SvelteKit's marker for
// a form that carries nothing but the CSRF-safe POST itself.
export const signOut = form('unchecked', async () => {
	await auth.api.signOut({ headers: requestHeaders() });

	redirect(303, '/login');
});
