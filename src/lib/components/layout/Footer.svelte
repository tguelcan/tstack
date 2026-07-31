<script lang="ts">
	import Logo from './Logo.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import { legalNavigation } from './navigation';
</script>

<footer class="border-t border-base-300 bg-base-100">
	<div class="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8">
		<Logo />

		<nav class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
			{#each legalNavigation as item (item.href)}
				<a href={item.href} class="text-muted hover:text-base-content">{item.label}</a>
			{/each}
		</nav>

		<div class="flex items-center gap-3">
			<span class="text-muted text-sm">© {new Date().getFullYear()} tstack</span>
			<ThemeToggle />
		</div>
	</div>
</footer>
