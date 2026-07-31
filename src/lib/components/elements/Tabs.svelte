<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';

	type Tab = {
		href: string;
		label: string;
		icon?: string;
	};

	type Props = {
		tabs: Tab[];
		/**
		 * Which tab to mark as current. Defaults to the current pathname, matched
		 * exactly — pass it explicitly when the tabs are not real navigation.
		 */
		active?: string;
		class?: string;
	};

	let { tabs, active, class: className }: Props = $props();

	const current = $derived(active ?? page.url.pathname);
</script>

<!-- `role="tablist"` is deliberately absent: these are links that load a new
     page, not panels toggled in place, so the tab widget's keyboard model
     (arrow keys, `aria-selected`) would promise interactions we do not have. -->
<nav class={['not-prose tabs tabs-border', className]}>
	{#each tabs as tab (tab.href)}
		<a
			href={tab.href}
			class={['tab gap-2', current === tab.href && 'tab-active']}
			aria-current={current === tab.href ? 'page' : undefined}
		>
			{#if tab.icon}
				<Icon name={tab.icon} size={16} />
			{/if}
			{tab.label}
		</a>
	{/each}
</nav>
