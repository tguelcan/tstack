/**
 * Navigation of the app shell and the public footer.
 *
 * Kept as data rather than markup, so the sidebar, the mobile drawer and any
 * future command palette all read the same list.
 */

export type NavItem = {
	href: string;
	label: string;
	/** Name from `elements/icons.ts`. */
	icon: string;
};

export type NavSection = {
	label: string;
	items: NavItem[];
};

export const appNavigation: NavSection[] = [
	{
		label: 'Workspace',
		items: [
			{ href: '/dashboard', label: 'Dashboard', icon: 'DashboardSquare01Icon' },
			{ href: '/crud', label: 'Tasks', icon: 'Task01Icon' },
			{ href: '/members', label: 'Members', icon: 'UserGroupIcon' }
		]
	},
	{
		label: 'Account',
		items: [
			{ href: '/profile', label: 'Profile', icon: 'User02Icon' },
			{ href: '/settings', label: 'Settings', icon: 'Settings01Icon' }
		]
	},
	{
		label: 'Reference',
		items: [{ href: '/components', label: 'Components', icon: 'Layers01Icon' }]
	}
];

export const legalNavigation: { href: string; label: string }[] = [
	{ href: '/privacy', label: 'Privacy' },
	{ href: '/terms', label: 'Terms' },
	{ href: '/imprint', label: 'Imprint' }
];

/**
 * Whether `href` is the section the visitor is currently in.
 *
 * Matches sub-paths as well, so `/settings/security` keeps the "Settings" entry
 * highlighted. `/` is compared exactly, otherwise it would match everything.
 */
export function isActive(pathname: string, href: string): boolean {
	return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
