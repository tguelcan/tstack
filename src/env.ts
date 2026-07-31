import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Since SvelteKit 3 environment variables are declared here. Only what is listed
 * below can be imported from `$app/env/private` or `$app/env/public`.
 *
 * `static` stays off (the default) so the value is read at startup — that way the
 * same build can run against different databases.
 *
 * Two kinds of variable live here. The first two are required: without them the
 * app cannot serve a single request, so they throw at startup rather than at the
 * first login. The rest are optional, because the features that need them are
 * switched off in `src/lib/server/config.json` by default — a throwing validator
 * would make the app unbootable the moment a provider is disabled. The pairing of
 * "enabled in the config" and "secret present" is checked once, with a pointed
 * error message, in `src/lib/server/auth.ts`.
 */

/** Optional variable: absent and empty mean the same thing to us. */
const optional = (value: string | undefined) => value ?? '';

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'Postgres connection for Prisma. See `.env.example` for the format.',
		schema: (value) => {
			if (!value) {
				throw new Error('DATABASE_URL is not set — create a `.env` based on `.env.example`');
			}

			return value;
		}
	},

	BETTER_AUTH_SECRET: {
		description: 'Signs session cookies and tokens. Generate with `openssl rand -base64 32`.',
		schema: (value) => {
			if (!value) {
				throw new Error(
					'BETTER_AUTH_SECRET is not set — generate one with `openssl rand -base64 32`'
				);
			}

			return value;
		}
	},

	BETTER_AUTH_URL: {
		description:
			'Public origin of this deployment, e.g. `https://app.example.com`. Better Auth builds the links in verification, reset and invitation emails from it — without it they point at the wrong route, which is why `src/lib/server/auth.ts` refuses to start outside development when it is missing.',
		schema: optional
	},

	RESEND_API_KEY: {
		description:
			'API key for Resend. Leave it empty in development — `src/lib/server/mail.ts` then prints the message to the terminal instead of sending it, which keeps the verification link reachable without an account.',
		schema: optional
	},

	UPLOAD_DIR: {
		description:
			'Directory for uploaded images. Keep it outside the app directory, otherwise a deployment wipes it — on Railway point it at a mounted volume, e.g. `/data/uploads`. Defaults to `.uploads` in the project root.',
		schema: (value) => value || '.uploads'
	},

	GOOGLE_CLIENT_ID: {
		description: 'OAuth client id, required when `auth.socialProviders.google` is on.',
		schema: optional
	},

	GOOGLE_CLIENT_SECRET: {
		description: 'OAuth client secret, required when `auth.socialProviders.google` is on.',
		schema: optional
	},

	GITHUB_CLIENT_ID: {
		description: 'OAuth client id, required when `auth.socialProviders.github` is on.',
		schema: optional
	},

	GITHUB_CLIENT_SECRET: {
		description: 'OAuth client secret, required when `auth.socialProviders.github` is on.',
		schema: optional
	}
});
