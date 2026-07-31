<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$components/elements/Button.svelte';
	import Footer from '$components/layout/Footer.svelte';
	import Logo from '$components/layout/Logo.svelte';
	import ThemeToggle from '$components/layout/ThemeToggle.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- Layout for the `+page.md` files in this group. mdsvex hands us plain HTML,
     so the `prose` classes from the typography plugin do all the styling and the
     markdown stays free of markup. -->
<div class="flex min-h-screen flex-col bg-base-100">
	<header class="border-b border-base-300">
		<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
			<Logo />
			<div class="flex items-center gap-2">
				<ThemeToggle />
				<Button href="/login" color="neutral" size="sm" variant="outline">Sign in</Button>
			</div>
		</div>
	</header>

	<main class="flex-1 px-6 py-12">
		<article class="mx-auto prose prose-sm max-w-3xl sm:prose-base">
			{@render children()}
		</article>
	</main>

	<Footer />
</div>
