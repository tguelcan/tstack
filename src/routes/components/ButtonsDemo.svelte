<script lang="ts">
	import Button from '$components/elements/Button.svelte';
	import Field from './Field.svelte';

	const colors = ['', 'neutral', 'primary', 'secondary', 'error', 'ghost', 'link'];
	const sizes = ['sm', 'md', 'lg'];

	let clicks = $state(0);
	let busy = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	function runTask() {
		busy = true;
		clearTimeout(timer);
		timer = setTimeout(() => (busy = false), 1200);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Colors" hint="color">
		{#each colors as color (color)}
			<Button {color}>{color || 'default'}</Button>
		{/each}
	</Field>

	<Field label="Sizes" hint="size">
		{#each sizes as size (size)}
			<Button color="primary" {size}>{size}</Button>
		{/each}
	</Field>

	<Field label="States" hint="loading / disabled">
		<Button color="primary">normal</Button>
		<Button color="primary" loading>loading</Button>
		<Button color="primary" disabled>disabled</Button>
	</Field>

	<Field label="With icons" hint="icon / iconRight / arrowLeft / arrowRight">
		<Button color="neutral" icon="PlusSignIcon">Icon left</Button>
		<Button color="neutral" icon="Download01Icon" iconRight>Icon right</Button>
		<Button color="ghost" arrowLeft>Back</Button>
		<Button color="ghost" arrowRight>Next</Button>
	</Field>

	<Field label="Icon only" hint="modifier / ariaLabel">
		<Button color="neutral" modifier="circle" icon="Search01Icon" ariaLabel="Search" />
		<Button color="primary" modifier="circle" icon="PlusSignIcon" ariaLabel="Add" />
		<Button color="ghost" modifier="circle" icon="Settings01Icon" ariaLabel="Settings" />
		<Button color="error" modifier="circle" icon="Delete02Icon" ariaLabel="Delete" />
	</Field>

	<Field label="Tooltips" hint="tooltip / tooltipPosition">
		<Button color="neutral" tooltip="Tooltip on top" icon="Alert01Icon">top</Button>
		<Button color="neutral" tooltip="Tooltip on the right" tooltipPosition="right">right</Button>
		<Button color="neutral" tooltip="Tooltip below" tooltipPosition="bottom">bottom</Button>
	</Field>

	<Field label="Rendered as a link" hint="href / target">
		<Button href="/" color="link">Internal link</Button>
		<Button href="https://svelte.dev/docs/kit" target="_blank" color="ghost" arrowRight>
			External link
		</Button>
	</Field>

	<Field label="Full width" hint="block">
		<Button color="primary" block>Block button</Button>
	</Field>

	<Field label="Interactive" hint="onclick">
		<Button color="primary" type="button" icon="StarIcon" onclick={() => clicks++}>
			Clicked: {clicks}
		</Button>
		<Button color="neutral" type="button" loading={busy} onclick={runTask}>
			{busy ? 'Working…' : 'Start task'}
		</Button>
	</Field>
</div>
