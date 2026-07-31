<script lang="ts">
	import Button from '$components/elements/Button.svelte';

	type Props = {
		/** How many entries are currently visible. */
		shown: number;
		/** How many exist in total for the current filters. */
		total: number;
		/** Link to the next page. Absent once everything is loaded. */
		href?: string;
	};

	let { shown, total, href }: Props = $props();
</script>

<!-- `reset="false"` is read from ancestors too, so it can sit on the wrapper:
     loading more must not throw the reader back to the top of the page. -->
<div class="flex flex-col items-center gap-3 py-6" data-sveltekit-reset="false">
	<p class="text-muted text-sm" aria-live="polite">
		{shown} of {total}
		{total === 1 ? 'entry' : 'entries'}
	</p>

	{#if href}
		<Button {href} color="neutral" size="sm">Load more</Button>
	{/if}
</div>
