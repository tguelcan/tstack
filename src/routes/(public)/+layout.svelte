<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$components/elements/Button.svelte';
	import Footer from '$components/layout/Footer.svelte';
	import Logo from '$components/layout/Logo.svelte';
	import { getIsSignedIn } from '$remotes/auth.remote';

	let { children }: { children: Snippet } = $props();

	// Sending a signed-in visitor to the login form is a dead end, so the one
	// button in this header points at the app instead once there is a session.
	const signedIn = $derived(await getIsSignedIn());
</script>

<!-- The public surface: landing page, the component showcase and the legal
     pages. They share one header and footer so they read as one site; each page
     below supplies its own column width. The theme toggle lives in the footer. -->
<div class="flex min-h-screen flex-col bg-base-100 px-6">
	<header>
		<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 py-4">
			<Logo />

			{#if signedIn}
				<Button href="/dashboard" color="primary" size="sm" rounded>Dashboard</Button>
			{:else}
				<Button href="/login" color="primary" size="sm" rounded>Sign in</Button>
			{/if}
		</div>
	</header>

	<main class="flex-1 py-12">
		{@render children()}
	</main>

	<Footer />
</div>
