<script lang="ts">
	import { fly } from 'svelte/transition';
	import Alert from './Alert.svelte';
	import Button from './Button.svelte';
	import { toast } from './toast-state.svelte';
</script>

<!--
	Host for `toast.*()`. Mount it once, in the root layout — a second instance
	would render every message twice, since they all read the same store.

	`toast` is daisyUI's fixed-position stack; `pointer-events-none` on it keeps
	the corner of the screen clickable while messages are on it, and each message
	takes its own events back.
-->
<div class="pointer-events-none toast toast-end toast-bottom z-50">
	{#each toast.items as item (item.id)}
		<div transition:fly={{ y: 12, duration: 150 }} class="pointer-events-auto">
			<Alert color={item.color} title={item.title} variant="soft" class="max-w-sm shadow-lg">
				{item.message}

				{#snippet actions()}
					<Button
						type="button"
						color="ghost"
						size="xs"
						modifier="circle"
						icon="Cancel01Icon"
						ariaLabel="Dismiss"
						onclick={() => toast.dismiss(item.id)}
					/>
				{/snippet}
			</Alert>
		</div>
	{/each}
</div>
