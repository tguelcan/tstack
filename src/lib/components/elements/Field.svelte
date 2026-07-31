<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		/** Caption rendered as the fieldset legend. */
		label: string;
		/** Attribute bag, typically from `form.fields.<name>.as('text')`. */
		input?: Record<string, unknown>;
		/**
		 * Replaces the `<input>` with your own control — a `<select>`, `<textarea>`
		 * or an input group — while keeping the legend, hint and error styling.
		 * Pass it as plain content, or as `{#snippet children({ invalid })}` when
		 * the control has to render the error state itself.
		 */
		children?: Snippet<[{ invalid: boolean }]>;
		/** Validation issues for this field; empty or undefined while it is valid. */
		issues?: { message: string }[];
		/** Helper text shown while there are no issues. */
		hint?: string;
		placeholder?: string;
		class?: string;
	};

	let { label, input, children, issues, hint, placeholder, class: className }: Props = $props();

	const hasIssues = $derived(!!issues?.length);
</script>

<fieldset class="fieldset {className}">
	<legend class={['fieldset-legend', hasIssues && 'text-error']}>{label}</legend>

	{#if children}
		{@render children({ invalid: hasIssues })}
	{:else}
		<!-- A `<legend>` labels the fieldset, not the input inside it, so without
		     `aria-label` the field would reach a screen reader unnamed. It sits
		     before the spread, so a caller can still override it. -->
		<input
			aria-label={label}
			{...input}
			{placeholder}
			class={['input', hasIssues && 'input-error']}
		/>
	{/if}

	{#each issues ?? [] as issue, index (index)}
		<p class="label text-error">{issue.message}</p>
	{:else}
		{#if hint}
			<p class="label">{hint}</p>
		{/if}
	{/each}
</fieldset>
