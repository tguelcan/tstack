<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- Layout for the `+page.md` files in this group. mdsvex hands us plain HTML,
     so the `prose` classes from the typography plugin do all the styling and the
     markdown stays free of markup. Header and footer come from `(public)`. -->
<article class="mx-auto prose prose-sm max-w-3xl sm:prose-base">
	{@render children()}
</article>
