<script lang="ts">
	import Icon from '$components/elements/Icon.svelte';
	import * as registry from '$components/elements/icons';
	import Field from './Field.svelte';

	const sizes = [16, 20, 24, 32, 48];
	const strokeWidths = [1, 1.5, 2, 2.5];

	const tones = [
		{ label: 'primary', class: 'text-primary' },
		{ label: 'secondary', class: 'text-secondary' },
		{ label: 'error', class: 'text-error' },
		{ label: 'muted', class: 'text-base-content/40' }
	];

	// Read straight out of the registry instead of being listed again here — a
	// second copy would silently fall behind the moment someone adds an icon.
	const names = Object.keys(registry).sort();
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Sizes" hint="size">
		{#each sizes as size (size)}
			<div class="flex flex-col items-center gap-2">
				<!-- Fixed-height box so the labels share one baseline. -->
				<div class="flex h-12 items-end"><Icon name="FavouriteIcon" {size} /></div>
				<span class="text-xs text-base-content/60">{size}</span>
			</div>
		{/each}
	</Field>

	<Field label="Stroke width" hint="strokeWidth">
		{#each strokeWidths as strokeWidth (strokeWidth)}
			<div class="flex flex-col items-center gap-2">
				<Icon name="Settings01Icon" size={32} {strokeWidth} />
				<span class="text-xs text-base-content/60">{strokeWidth}</span>
			</div>
		{/each}
	</Field>

	<Field label="Color is inherited from currentColor" hint="class on the parent">
		{#each tones as tone (tone.label)}
			<div class="flex flex-col items-center gap-2">
				<span class={tone.class}><Icon name="StarIcon" size={32} /></span>
				<span class="text-xs text-base-content/60">{tone.label}</span>
			</div>
		{/each}
	</Field>
</div>

<div class="not-prose mt-4">
	<div class="mb-3 flex items-baseline justify-between gap-3">
		<span class="text-sm font-semibold">Gallery</span>
		<code class="shrink-0 text-xs text-base-content/50">name</code>
	</div>
	<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
		{#each names as name (name)}
			<div
				class="flex flex-col items-center gap-2 rounded-box bg-base-200/40 p-3 text-center transition-colors hover:bg-base-200"
				title={name}
			>
				<Icon {name} size={24} />
				<span class="w-full truncate text-[10px] leading-tight text-base-content/60">{name}</span>
			</div>
		{/each}
	</div>
</div>
