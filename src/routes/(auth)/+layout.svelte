<script lang="ts">
	import type { Snippet } from 'svelte';
	import BrandPanel from '$components/layout/BrandPanel.svelte';
	import Footer from '$components/layout/Footer.svelte';
	import Logo from '$components/layout/Logo.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="grid min-h-screen bg-base-100 lg:grid-cols-2">
	<div class="flex flex-col">
		<!-- From `lg` up the brand panel carries the logo, so this row is only
		     here for the narrow layout. -->
		<div class="p-6 lg:hidden">
			<Logo />
		</div>

		<div class="flex flex-1 items-center justify-center px-6 pt-4 pb-12">
			<div class="w-full max-w-sm">{@render children()}</div>
		</div>

		<!-- The legal links belong on the sign-up screens too; the footer brings
		     the theme toggle with it, which is why the top row no longer has one. -->
		<div class="px-6">
			<Footer />
		</div>
	</div>

	<BrandPanel />
</div>
