<script lang="ts">
	import Alert from '$components/elements/Alert.svelte';
	import Button from '$components/elements/Button.svelte';
	import EmptyState from '$components/elements/EmptyState.svelte';
	import Field from './Field.svelte';

	const colors = ['info', 'success', 'warning', 'error'] as const;
	const variants = ['soft', 'outline', 'dash'] as const;
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Colors" hint="color — picks the icon and the role">
		<div class="grid w-full gap-2">
			{#each colors as color (color)}
				<Alert {color}>This is the {color} level.</Alert>
			{/each}
		</div>
	</Field>

	<Field label="Variants" hint="variant">
		<div class="grid w-full gap-2">
			{#each variants as variant (variant)}
				<Alert color="info" {variant}>Rendered as {variant}.</Alert>
			{/each}
		</div>
	</Field>

	<Field label="Title, body and actions" hint="title / actions">
		<Alert color="warning" title="Two-factor authentication is off" class="w-full">
			{#snippet actions()}
				<Button size="sm" color="warning">Turn on</Button>
			{/snippet}
			Your account is protected by the password alone.
		</Alert>
	</Field>

	<Field label="Empty state" hint="EmptyState: icon / title / description / action">
		<EmptyState
			class="w-full"
			icon="Task01Icon"
			title="No tasks yet"
			description="Tasks you create show up here, along with the ones assigned to you."
		>
			{#snippet action()}
				<Button color="primary" icon="PlusSignIcon">New task</Button>
			{/snippet}
		</EmptyState>
	</Field>
</div>
