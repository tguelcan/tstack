<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$components/elements/Button.svelte';
	import Footer from '$components/layout/Footer.svelte';
	import Logo from '$components/layout/Logo.svelte';
	import ThemeToggle from '$components/layout/ThemeToggle.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen flex-col bg-base-100">
	<header class="border-b border-base-300">
		<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
			<Logo />
			<div class="flex items-center gap-2">
				<!-- The showcase is the one page where flipping the theme is the point:
				     every element below has to hold up in both. -->
				<ThemeToggle />
				<Button href="/dashboard" color="neutral" size="sm" variant="outline">Open the app</Button>
			</div>
		</div>
	</header>

	<main class="flex-1 px-6 py-10">
		<div class="mx-auto prose prose-sm max-w-5xl sm:prose-base">
			{@render children()}
		</div>
	</main>

	<Footer />
</div>
