<script lang="ts">
	import Icon from '$components/elements/Icon.svelte';
	import Logo from './Logo.svelte';

	// Three lines of proof next to the form. Kept here rather than in the pages,
	// so all four auth screens make the same promise.
	const highlights = [
		{
			icon: 'RocketIcon',
			title: 'Ship on day one',
			text: 'Routing, forms and validation are wired up and work without JavaScript.'
		},
		{
			icon: 'Shield01Icon',
			title: 'Safe by default',
			text: 'Every mutation goes through a typed remote function on the server.'
		},
		{
			icon: 'Layers01Icon',
			title: 'Yours to shape',
			text: 'A handful of elements and a theme — no framework on top of the framework.'
		}
	];
</script>

<!-- Decoration only: the form on the other side carries the whole flow, so this
     panel disappears below `lg` instead of pushing the inputs off screen. -->
<aside class="relative hidden overflow-hidden bg-secondary text-secondary-content lg:flex">
	<div
		class="absolute -top-24 -right-24 size-96 rounded-full bg-primary/30 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="absolute -bottom-32 -left-16 size-80 rounded-full bg-accent/20 blur-3xl"
		aria-hidden="true"
	></div>

	<div class="relative flex flex-col justify-between p-10 xl:p-14">
		<Logo href="/" class="text-secondary-content" />

		<div class="max-w-md py-12">
			<p class="text-3xl leading-tight font-semibold text-balance">
				The boring parts of a SaaS, already built.
			</p>

			<ul class="mt-10 space-y-6">
				{#each highlights as highlight (highlight.title)}
					<li class="flex items-start gap-4">
						<span class="">
							<Icon name={highlight.icon} size={18} />
						</span>
						<div class="-mt-1.5">
							<p class="font-medium">{highlight.title}</p>
							<p class="text-sm opacity-70">{highlight.text}</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<p class="text-sm opacity-60">© {new Date().getFullYear()} tstack</p>
	</div>
</aside>
