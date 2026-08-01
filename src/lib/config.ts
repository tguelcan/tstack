import { z } from 'zod';
import raw from './config.json';

/**
 * Everything the browser is allowed to know: what the app is called, what it
 * links to, and the copy on the pages a visitor sees before signing in.
 *
 * This is the public half of the configuration. It is imported by components,
 * so every value in here ships to the client — put nothing in this file that
 * should stay on the server. Server-side decisions (auth, mail, uploads) live
 * in `src/lib/server/config.json`, secrets in `src/env.ts`.
 *
 * Parsed with the same rigour as the server config: a typo should stop the
 * build, not surface as an empty heading in production.
 */

const AppSchema = z.object({
	name: z.string().min(1),
	version: z.string().optional(),
	/** Name from `elements/icons.ts`, drawn in the logo tile. */
	icon: z.string().min(1),
	/** Prefix shown in front of a workspace slug, e.g. `myapp.app/acme`. */
	workspaceDomain: z.string().min(1)
});

const NavItemSchema = z.object({
	href: z.string().min(1),
	label: z.string().min(1),
	/** Name from `elements/icons.ts`. */
	icon: z.string().min(1)
});

const NavSectionSchema = z.object({
	label: z.string().min(1),
	items: z.array(NavItemSchema).min(1)
});

const NavigationSchema = z.object({
	/**
	 * The sidebar and the mobile drawer read this same list. The hrefs have to
	 * point at routes that exist — nothing here checks that for you.
	 */
	app: z.array(NavSectionSchema).min(1),
	/** Footer links, on every public page and every auth screen. */
	legal: z.array(z.object({ href: z.string().min(1), label: z.string().min(1) }))
});

const ContentSchema = z.object({
	landing: z.object({
		headline: z.string().min(1),
		subline: z.string().min(1),
		entries: z.array(NavItemSchema.extend({ text: z.string().min(1) }))
	}),
	/** The panel beside the sign-in form; the same promise on all auth screens. */
	authPanel: z.object({
		headline: z.string().min(1),
		highlights: z
			.array(
				z.object({ icon: z.string().min(1), title: z.string().min(1), text: z.string().min(1) })
			)
			.min(1)
	})
});

const ConfigSchema = z.object({
	app: AppSchema,
	navigation: NavigationSchema,
	content: ContentSchema
});

export type AppConfig = z.infer<typeof AppSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
export type NavSection = z.infer<typeof NavSectionSchema>;
export type LandingEntry = ContentConfig['landing']['entries'][number];
export type ContentConfig = z.infer<typeof ContentSchema>;

export const config = ConfigSchema.parse(raw);
