import { z } from 'zod';
import { config as publicConfig } from '$config';
import raw from './config.json';

/**
 * Everything about this app that is a decision rather than a secret.
 *
 * The values live in `config.json` so they can be read and changed without
 * touching code; the schemas below are what turns that file into something the
 * rest of the server can rely on. Parsing happens once, at import: a typo in the
 * config should stop the app at startup, not at the first login.
 *
 * This file is server-only, so nothing in it reaches the browser. What the
 * client needs — the app name, the navigation, the marketing copy — lives in
 * `src/lib/config.json` and is re-exported below as `config.app`, so server code
 * can keep reading `config.app.name` without knowing which file it came from.
 *
 * Secrets stay out of here — they are declared in `src/env.ts` and read from the
 * environment. `config.json` only decides *whether* a feature is on;
 * `src/lib/server/auth.ts` checks that the matching credentials actually exist.
 */

const AuthSchema = z.object({
	emailAndPassword: z.object({
		enabled: z.boolean(),
		minPasswordLength: z.number().int().min(1),
		/**
		 * With this on, `signUpEmail` returns no session and `signInEmail` answers
		 * 403 until the address is confirmed. Turning it off makes local work
		 * easier, at the price of accepting unverified addresses.
		 */
		requireEmailVerification: z.boolean()
	}),
	socialProviders: z.object({
		google: z.boolean(),
		github: z.boolean()
	}),
	/**
	 * Headers to read the visitor's IP from, in order, for rate limiting. Behind
	 * a proxy that terminates TLS — Railway, Fly, a load balancer — the socket
	 * address is the proxy's, so without this every visitor shares one bucket.
	 *
	 * Only list a header the proxy in front of you *overwrites*. Anything a
	 * client can set reaches Better Auth verbatim, and a spoofed value would let
	 * one caller rate-limit as many identities as it likes. Empty means "use the
	 * socket address" — correct when nothing sits in front of the app.
	 */
	ipAddressHeaders: z.array(z.string().min(1)),
	session: z.object({
		/** Seconds a session stays valid. */
		expiresIn: z.number().int().positive(),
		/** Seconds after which activity extends the session. */
		updateAge: z.number().int().positive(),
		/**
		 * Seconds a session counts as "fresh". Better Auth demands freshness for
		 * sensitive endpoints — listing sessions, deleting the account.
		 */
		freshAge: z.number().int().nonnegative()
	}),
	organization: z.object({
		allowUserToCreateOrganization: z.boolean(),
		creatorRole: z.enum(['owner', 'admin']),
		/** Seconds an invitation link stays valid. */
		invitationExpiresIn: z.number().int().positive(),
		membershipLimit: z.number().int().positive()
	})
});

const MailSchema = z.object({
	/** Envelope sender, e.g. `MyApp <noreply@example.com>`. */
	from: z.string().min(1)
});

/**
 * One output format. Every image the app stores goes through exactly one of
 * these, so an avatar is the same size no matter where it was uploaded.
 *
 * `fit` follows sharp: `cover` crops to fill the box, `contain` pads to it,
 * `inside` shrinks to fit without ever growing the image.
 */
const ImagePresetSchema = z.object({
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	fit: z.enum(['cover', 'contain', 'inside']),
	quality: z.number().int().min(1).max(100)
});

const UploadsSchema = z.object({
	maxBytes: z.number().int().positive(),
	/** Accepted source types. The output is always WebP. */
	accept: z.array(z.string().min(1)).min(1),
	/** Whether `/uploads/…` requires a session. Off makes every image public. */
	requireSession: z.boolean(),
	/**
	 * Named as an object rather than a record, so `PresetName` is a union and
	 * `storeImage(file, 'avatr')` is a type error instead of a 500.
	 */
	presets: z.object({
		avatar: ImagePresetSchema,
		logo: ImagePresetSchema,
		/** Defined but not wired up yet — the shape for images inside content. */
		content: ImagePresetSchema
	})
});

const ConfigSchema = z.object({
	auth: AuthSchema,
	mail: MailSchema,
	uploads: UploadsSchema
});

export type AuthConfig = z.infer<typeof AuthSchema>;
export type MailConfig = z.infer<typeof MailSchema>;
export type UploadsConfig = z.infer<typeof UploadsSchema>;
export type ImagePreset = z.infer<typeof ImagePresetSchema>;
export type PresetName = keyof UploadsConfig['presets'];

/** Server decisions, plus the public `app` section so both read the same name. */
export const config = { ...ConfigSchema.parse(raw), app: publicConfig.app };
