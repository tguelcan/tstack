<script lang="ts">
	import Button from '$components/elements/Button.svelte';
	import { toast } from '$components/elements/toast-state.svelte';
	import Field from './Field.svelte';

	const colors = ['info', 'success', 'warning', 'error'] as const;
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Levels" hint="toast.info / success / warning / error">
		{#each colors as color (color)}
			<Button
				type="button"
				{color}
				variant="soft"
				onclick={() => toast[color](`A ${color} toast.`)}
			>
				{color}
			</Button>
		{/each}
	</Field>

	<Field label="With a title" hint={'{ title }'}>
		<Button
			type="button"
			color="neutral"
			variant="outline"
			onclick={() =>
				toast.success('Everyone on the invite list will get an email.', {
					title: 'Invitations sent'
				})}
		>
			Show
		</Button>
	</Field>

	<Field label="Stays until dismissed" hint={'{ timeout: 0 }'}>
		<Button
			type="button"
			color="neutral"
			variant="outline"
			onclick={() =>
				toast.error('The server did not respond. Your changes are still here.', {
					title: 'Could not save',
					timeout: 0
				})}
		>
			Show
		</Button>
	</Field>

	<Field label="They stack" hint="one call per message">
		<Button
			type="button"
			color="neutral"
			onclick={() => colors.forEach((color, index) => toast[color](`Message ${index + 1}`))}
		>
			Fire four
		</Button>
	</Field>
</div>
