<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = {
		/** What is being measured, e.g. "Monthly revenue". */
		label: string;
		/** The formatted figure — formatting is the caller's job. */
		value: string;
		icon?: string;
		/**
		 * Change against the previous period in percent. Positive reads as
		 * success, negative as error; `0` and `undefined` stay neutral.
		 */
		delta?: number;
		/** Names the comparison period, e.g. "vs. last month". */
		hint?: string;
		class?: string;
	};

	let { label, value, icon, delta, hint, class: className }: Props = $props();

	const direction = $derived(delta === undefined || delta === 0 ? 0 : delta > 0 ? 1 : -1);
</script>

<div class={['not-prose card border border-base-300 bg-base-100 p-5', className]}>
	<div class="flex items-start justify-between gap-3">
		<p class="text-muted text-sm">{label}</p>
		{#if icon}
			<span class="text-base-content/30"><Icon name={icon} size={20} /></span>
		{/if}
	</div>

	<p class="mt-2 text-2xl font-semibold tabular-nums">{value}</p>

	{#if delta !== undefined || hint}
		<div class="mt-2 flex items-center gap-1.5 text-sm">
			{#if delta !== undefined}
				<span
					class={[
						'inline-flex items-center gap-0.5 font-medium',
						direction > 0 && 'text-success',
						direction < 0 && 'text-error',
						direction === 0 && 'text-muted'
					]}
				>
					{#if direction !== 0}
						<Icon
							name={direction > 0 ? 'ArrowUpRight01Icon' : 'ArrowDownRight01Icon'}
							size={16}
							strokeWidth={2}
						/>
					{/if}
					{direction > 0 ? '+' : ''}{delta}%
				</span>
			{/if}
			{#if hint}
				<span class="text-muted">{hint}</span>
			{/if}
		</div>
	{/if}
</div>
