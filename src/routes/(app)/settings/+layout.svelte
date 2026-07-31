<script lang="ts">
	import type { Snippet } from 'svelte';
	import Tabs from '$components/elements/Tabs.svelte';
	import PageHeader from '$components/layout/PageHeader.svelte';

	let { children }: { children: Snippet } = $props();

	// Real links, so each tab is its own URL — shareable, and it survives a reload.
	const tabs = [
		{ href: '/settings', label: 'General', icon: 'Settings01Icon' },
		{ href: '/settings/billing', label: 'Billing', icon: 'CreditCardIcon' },
		{ href: '/settings/notifications', label: 'Notifications', icon: 'Notification01Icon' },
		{ href: '/settings/security', label: 'Security', icon: 'Shield01Icon' }
	];
</script>

<PageHeader title="Settings" description="Your organization and your account.">
	<Tabs {tabs} />
</PageHeader>

{@render children()}
