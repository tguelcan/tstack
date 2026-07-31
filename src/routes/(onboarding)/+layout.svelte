<script lang="ts">
	import type { Snippet } from 'svelte';
	import Logo from '$components/layout/Logo.svelte';
	import ThemeToggle from '$components/layout/ThemeToggle.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!--
	A layout of its own, because onboarding sits between the two the app already
	has: there is a session, so the split brand panel of `(auth)` would be a step
	backwards — but there is no organization yet, so the shell's sidebar would be
	a menu of pages that all bounce straight back here. What is left is a single
	centred column.
-->
<div class="flex min-h-screen flex-col bg-base-200/50">
	<header class="flex items-center gap-4 px-6 py-5">
		<Logo class="mr-auto" />
		<ThemeToggle />
	</header>

	<main class="flex flex-1 justify-center px-4 pt-4 pb-16 sm:px-6">
		<div class="w-full max-w-xl">{@render children()}</div>
	</main>
</div>
