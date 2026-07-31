<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Props = {
		/** Icon above the title — a picture of what is missing. */
		icon?: string;
		title: string;
		/** Says why the list is empty and what to do about it. */
		description?: string;
		/** The way out, usually a single primary `Button`. */
		action?: Snippet;
		class?: string;
	};

	let { icon = 'InboxIcon', title, description, action, class: className }: Props = $props();
</script>

<div
	class={[
		'not-prose flex flex-col items-center rounded-box border border-dashed border-base-300 px-6 py-12 text-center',
		className
	]}
>
	<span class="mb-4 grid size-12 place-items-center rounded-full bg-base-200 text-base-content/40">
		<Icon name={icon} size={24} />
	</span>

	<p class="font-medium">{title}</p>

	{#if description}
		<p class="text-muted mt-1 max-w-sm text-sm">{description}</p>
	{/if}

	{#if action}
		<div class="mt-5">{@render action()}</div>
	{/if}
</div>
