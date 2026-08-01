<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="mx-auto prose prose-sm max-w-5xl sm:prose-base">
	{@render children()}
</div>
