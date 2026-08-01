<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from './Sidebar.svelte';
	import Topbar from './Topbar.svelte';
	import type { WorkspaceOrganization, WorkspaceUser } from './workspace';

	type Props = {
		children: Snippet;
		user: WorkspaceUser;
		/** The organization everything on screen belongs to. */
		organization: WorkspaceOrganization;
		/** Everything this user could switch to, `organization` included. */
		organizations: WorkspaceOrganization[];
	};

	let { children, user, organization, organizations }: Props = $props();

	// Only relevant below `lg`, where the sidebar is off-canvas. Bound rather than
	// left to the browser so following a link can close the drawer — a client-side
	// navigation keeps this layout mounted, and with it the checkbox state.
	let drawerOpen = $state(false);
</script>

<div class="drawer lg:drawer-open">
	<input id="app-drawer" type="checkbox" class="drawer-toggle" bind:checked={drawerOpen} />

	<div class="drawer-content flex min-h-screen flex-col">
		<Topbar name={user.name} email={user.email} avatar={user.image} />

		<main class="flex-1 px-4 py-6 sm:px-6">
			<div class="w-full">{@render children()}</div>
		</main>
	</div>

	<div class="drawer-side z-40">
		<label for="app-drawer" aria-label="Close navigation" class="drawer-overlay"></label>
		<Sidebar {organization} {organizations} onnavigate={() => (drawerOpen = false)} />
	</div>
</div>
