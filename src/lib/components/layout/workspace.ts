/**
 * The shapes the app shell renders. They mirror what `getWorkspace()` returns
 * without importing it, so a component never pulls a remote function — and its
 * server imports — into the browser bundle.
 */

export type WorkspaceUser = {
	name: string;
	email: string;
	image?: string | null;
};

export type WorkspaceOrganization = {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
};
