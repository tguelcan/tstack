/**
 * Navigation of the app shell and the public footer.
 *
 * The lists themselves live in `src/lib/config.json` so they can be changed
 * without touching code; this module re-exports them under the names the
 * components already use and adds the one piece of logic they need.
 */

import { config } from '$config';

export type { NavItem, NavSection } from '$config';

export const appNavigation = config.navigation.app;

export const legalNavigation = config.navigation.legal;

/**
 * Whether `href` is the section the visitor is currently in.
 *
 * Matches sub-paths as well, so `/settings/security` keeps the "Settings" entry
 * highlighted. `/` is compared exactly, otherwise it would match everything.
 */
export function isActive(pathname: string, href: string): boolean {
	return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
