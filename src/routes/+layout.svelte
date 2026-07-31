<script lang="ts">
	import '$css/main.css';
	import favicon from '$assets/favicon.svg';
	import Toaster from '$components/elements/Toaster.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<!-- One host for every `toast.*()` call in the app; see `toast-state.svelte.ts`. -->
<Toaster />
