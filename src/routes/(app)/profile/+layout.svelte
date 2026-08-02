<script lang="ts">
	import type { Snippet } from 'svelte';
	import Tabs from '$components/elements/Tabs.svelte';
	import PageHeader from '$components/layout/PageHeader.svelte';

	let { children }: { children: Snippet } = $props();

	// Everything here belongs to the person signed in, not to the workspace —
	// that split is the whole point of having two areas. Organization-wide
	// settings live under `/settings`.
	const tabs = [
		{ href: '/profile', label: 'Profile', icon: 'User02Icon' },
		{ href: '/profile/notifications', label: 'Notifications', icon: 'Notification01Icon' },
		{ href: '/profile/security', label: 'Security', icon: 'Shield01Icon' }
	];
</script>

<PageHeader title="Account" description="Your details, your alerts, your sign-in.">
	<Tabs {tabs} />
</PageHeader>

{@render children()}
