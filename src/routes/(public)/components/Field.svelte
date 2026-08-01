<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		/** Short title of the demo row. */
		label: string;
		/** The prop(s) this row demonstrates, shown as inline code. */
		hint: string;
		children: Snippet;
	};

	let { label, hint, children }: Props = $props();
</script>

<div class="not-prose rounded-box bg-base-200/40 p-4">
	<div class="mb-3 flex items-baseline justify-between gap-3">
		<span class="text-sm font-semibold">{label}</span>
		<code class="shrink-0 text-xs text-base-content/50">{hint}</code>
	</div>
	<div class="flex flex-wrap items-center gap-3">{@render children()}</div>
</div>
