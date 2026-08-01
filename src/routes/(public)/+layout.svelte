<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$components/elements/Button.svelte';
	import Footer from '$components/layout/Footer.svelte';
	import Logo from '$components/layout/Logo.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- The public surface: landing page, the component showcase and the legal
     pages. They share one header and footer so they read as one site; each page
     below supplies its own column width. The theme toggle lives in the footer. -->
<div class="flex min-h-screen flex-col bg-base-100 px-6">
	<header>
		<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 py-4">
			<Logo />
			<Button href="/login" color="primary" size="sm" rounded>Sign in</Button>
		</div>
	</header>

	<main class="flex-1 py-12">
		{@render children()}
	</main>

	<Footer />
</div>
