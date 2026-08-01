<script lang="ts">
	import PageTitle from '$components/layout/PageTitle.svelte';
	import Button from '$components/elements/Button.svelte';
	import Icon from '$components/elements/Icon.svelte';
	import { config } from '$config';

	const { headline, subline, entries } = config.content.landing;
</script>

<PageTitle />

<div class="mx-auto w-full max-w-5xl">
	<h1 class="max-w-2xl text-3xl font-semibold text-balance sm:text-4xl">
		{headline}
	</h1>
	<p class="text-muted mt-4 max-w-xl">
		{subline}
	</p>

	<div class="mt-6 flex flex-wrap gap-3">
		<Button href="/dashboard" color="primary" arrowRight>Open the app</Button>
		<Button href="/components" color="neutral" variant="outline">Browse components</Button>
	</div>

	<ul class="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each entries as entry (entry.href)}
			<li>
				<a
					href={entry.href}
					class="group flex h-full flex-col rounded-box border border-base-300 p-5 transition-colors hover:border-primary hover:bg-base-200/50"
				>
					<span class="flex items-center gap-2.5 font-medium">
						<Icon name={entry.icon} size={18} />
						{entry.label}
						<span
							class="ml-auto text-base-content/30 transition-transform group-hover:translate-x-0.5 group-hover:text-base-content"
						>
							<Icon name="ArrowRight01Icon" size={16} />
						</span>
					</span>
					<span class="text-muted mt-2 text-sm">{entry.text}</span>
				</a>
			</li>
		{/each}
	</ul>
</div>
