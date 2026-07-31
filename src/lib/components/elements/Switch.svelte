<script lang="ts">
	type Props = {
		label: string;
		/** Explains the consequence of turning this on. */
		description?: string;
		/** Bind to read the state back: `bind:checked={settings.emails}`. */
		checked?: boolean;
		/** Set it to submit the switch with a surrounding form. */
		name?: string;
		value?: string;
		/**
		 * Attribute bag from `form.fields.<name>.as('checkbox', initial)`, for a
		 * switch inside a remote form. Those field names carry the form's id, so a
		 * plain `name` would not be read back on submit — pass this instead.
		 */
		input?: Record<string, unknown>;
		disabled?: boolean;
		class?: string;
	};

	let {
		label,
		description,
		checked = $bindable(false),
		name,
		value = 'on',
		input,
		disabled = false,
		class: className
	}: Props = $props();
</script>

<!-- A real `<label>` wrapping the checkbox, so the whole row — including the
     description — is a click target and reads as one control. -->
<label
	class={[
		'not-prose flex cursor-pointer items-start justify-between gap-4 py-3',
		disabled && 'cursor-not-allowed opacity-60',
		className
	]}
>
	<span class="min-w-0">
		<span class="block text-sm font-medium">{label}</span>
		{#if description}
			<span class="text-muted mt-0.5 block text-sm">{description}</span>
		{/if}
	</span>

	{#if input}
		<!-- The bag already carries `name`, `type` and the initial state, so this
		     branch stays uncontrolled — binding on top of it would fight the value
		     the server sent back after a failed submit. -->
		<input {...input} class="toggle shrink-0 toggle-primary" {disabled} />
	{:else}
		<input
			type="checkbox"
			class="toggle shrink-0 toggle-primary"
			bind:checked
			{name}
			{value}
			{disabled}
		/>
	{/if}
</label>
