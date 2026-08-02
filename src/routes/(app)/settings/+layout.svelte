<script lang="ts">
	import type { Snippet } from 'svelte';
	import Tabs from '$components/elements/Tabs.svelte';
	import PageHeader from '$components/layout/PageHeader.svelte';

	let { children }: { children: Snippet } = $props();

	// Real links, so each tab is its own URL — shareable, and it survives a
	// reload. Only what belongs to the workspace lives here; anything tied to the
	// person signed in — profile, notifications, sign-in — is under `/profile`.
	const tabs = [
		{ href: '/settings', label: 'General', icon: 'Settings01Icon' },
		{ href: '/settings/billing', label: 'Billing', icon: 'CreditCardIcon' }
	];
</script>

<PageHeader title="Settings" description="Everyone in this organization is affected by these.">
	<Tabs {tabs} />
</PageHeader>

{@render children()}
