<script lang="ts">
	import Field from '$components/elements/Field.svelte';
	import Icon from '$components/elements/Icon.svelte';

	type Props = {
		label: string;
		/** Attribute bag from `form.fields._password.as('password')`. */
		input: Record<string, unknown>;
		issues?: { message: string }[];
		hint?: string;
		placeholder?: string;
	};

	let { label, input, issues, hint, placeholder = '••••••••' }: Props = $props();

	let visible = $state(false);
</script>

<Field {label} {issues} {hint}>
	{#snippet children({ invalid })}
		<!-- A `<div>`, not daisyUI's usual `<label class="input">`: a label wrapping
		     both the input and the button would hand the input the button's text as
		     its accessible name ("Show password"). Hence the explicit `aria-label`. -->
		<div class={['input items-center gap-1', invalid && 'input-error']}>
			<!-- `type` comes last so it overrides the `password` from the attribute
			     bag while the eye is open. -->
			<input
				aria-label={label}
				{...input}
				type={visible ? 'text' : 'password'}
				{placeholder}
				class="grow"
			/>

			<button
				type="button"
				class="btn btn-circle btn-ghost btn-xs"
				onclick={() => (visible = !visible)}
				aria-label={visible ? 'Hide password' : 'Show password'}
			>
				<Icon name={visible ? 'ViewOffSlashIcon' : 'ViewIcon'} size={16} />
			</button>
		</div>
	{/snippet}
</Field>
