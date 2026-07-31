<script lang="ts">
	import Badge from '$components/elements/Badge.svelte';
	import Field from './Field.svelte';

	const colors = [
		'neutral',
		'primary',
		'secondary',
		'accent',
		'info',
		'success',
		'warning',
		'error'
	] as const;
	const variants = ['outline', 'dash', 'soft', 'ghost'] as const;
	const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Colors" hint="color">
		<Badge>default</Badge>
		{#each colors as color (color)}
			<Badge {color}>{color}</Badge>
		{/each}
	</Field>

	<Field label="Variants" hint="variant">
		{#each variants as variant (variant)}
			<Badge color="primary" {variant}>{variant}</Badge>
		{/each}
	</Field>

	<Field label="Sizes" hint="size">
		{#each sizes as size (size)}
			<Badge color="primary" {size}>{size}</Badge>
		{/each}
	</Field>

	<Field label="With icons" hint="icon">
		<Badge color="success" icon="CheckmarkCircle01Icon">Done</Badge>
		<Badge color="warning" variant="soft" icon="Alert01Icon">Pending</Badge>
		<Badge color="error" variant="outline" icon="Cancel01Icon">Failed</Badge>
		<Badge color="neutral" size="lg" icon="StarIcon">Featured</Badge>
	</Field>
</div>
