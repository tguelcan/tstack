<script lang="ts">
	import type { Snippet } from 'svelte';
	import BrandPanel from '$components/layout/BrandPanel.svelte';
	import Logo from '$components/layout/Logo.svelte';
	import ThemeToggle from '$components/layout/ThemeToggle.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="grid min-h-screen bg-base-100 lg:grid-cols-2">
	<div class="flex flex-col">
		<div class="flex items-center justify-end gap-4 p-6">
			<Logo class="mr-auto lg:hidden" />
			<ThemeToggle />
		</div>

		<div class="flex flex-1 items-center justify-center px-6 pt-4 pb-12">
			<div class="w-full max-w-sm">{@render children()}</div>
		</div>
	</div>

	<BrandPanel />
</div>
