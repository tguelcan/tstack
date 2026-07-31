<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$components/elements/Button.svelte';
	import AppShell from '$components/layout/AppShell.svelte';
	import { getWorkspace } from '$remotes/organization.remote';

	let { children }: { children: Snippet } = $props();

	// Who you are and which organization you are in, in one round trip. Everything
	// behind this layout is scoped to that organization; `requireOrg()` on the
	// server sends you to `/onboarding` when there is nothing to scope to.
	const workspace = $derived(await getWorkspace());
</script>

<AppShell
	user={workspace.user}
	organization={workspace.organization}
	organizations={workspace.organizations}
>
	<!-- Deliberately without a `pending` snippet: if a boundary has one during
	     SSR, Svelte renders only that and skips the content — the page would
	     reach the browser empty without JavaScript. -->
	<svelte:boundary>
		{@render children()}

		{#snippet failed(error, reset)}
			<div role="alert" class="alert alert-error">
				<span>{error instanceof Error ? error.message : 'Something went wrong.'}</span>
				<Button size="sm" onclick={reset}>Try again</Button>
			</div>
		{/snippet}
	</svelte:boundary>
</AppShell>
