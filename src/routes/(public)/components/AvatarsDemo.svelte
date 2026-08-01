<script lang="ts">
	import Avatar from '$components/elements/Avatar.svelte';
	import favicon from '$assets/favicon.svg';
	import Field from './Field.svelte';

	const people = [
		'Ada Lovelace',
		'Grace Hopper',
		'Alan Turing',
		'Katherine Johnson',
		'Linus Torvalds'
	];

	const sizes = [24, 32, 48, 64, 96];
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Generated from the name" hint="name">
		{#each people as name (name)}
			<div class="flex flex-col items-center gap-2">
				<Avatar {name} size={56} />
				<span class="text-xs text-base-content/60">{name.split(' ')[0]}</span>
			</div>
		{/each}
	</Field>

	<Field label="Sizes" hint="size">
		{#each sizes as size (size)}
			<div class="flex flex-col items-center gap-2">
				<!-- Fixed-height box so the labels share one baseline. -->
				<div class="flex h-24 items-end"><Avatar name="Ada Lovelace" {size} /></div>
				<span class="text-xs text-base-content/60">{size}px</span>
			</div>
		{/each}
	</Field>

	<Field label="With an image" hint="src">
		<div class="flex flex-col items-center gap-2">
			<Avatar name="SvelteKit" src={favicon} size={64} class="bg-base-200" />
			<span class="text-xs text-base-content/60">image</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<Avatar name="Broken path" src="/does-not-exist.png" size={64} />
			<span class="text-xs text-base-content/60">fallback on load error</span>
		</div>
	</Field>

	<Field label="Group" hint="class">
		<div class="flex -space-x-4">
			{#each people.slice(0, 4) as name (name)}
				<Avatar {name} size={48} class="ring-2 ring-base-100" />
			{/each}
			<div
				class="flex size-12 items-center justify-center rounded-full bg-base-200 text-xs font-medium text-base-content/70 ring-2 ring-base-100"
			>
				+{people.length - 4}
			</div>
		</div>
	</Field>
</div>
