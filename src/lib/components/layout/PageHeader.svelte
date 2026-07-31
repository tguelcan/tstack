<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		/** One line on what this page is for. */
		description?: string;
		/** Primary actions for the page, aligned to the right of the title. */
		actions?: Snippet;
		/** Tabs or filters directly below the heading. */
		children?: Snippet;
		class?: string;
	};

	let { title, description, actions, children, class: className }: Props = $props();
</script>

<div class={['not-prose mb-6', className]}>
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="min-w-0">
			<h1 class="truncate text-xl font-semibold sm:text-2xl">{title}</h1>
			{#if description}
				<p class="text-muted mt-1 text-sm">{description}</p>
			{/if}
		</div>

		{#if actions}
			<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>
		{/if}
	</div>

	{#if children}
		<div class="mt-4">{@render children()}</div>
	{/if}
</div>
