<script lang="ts">
	import FieldElement from '$components/elements/Field.svelte';
	import Switch from '$components/elements/Switch.svelte';
	import Field from './Field.svelte';

	let notify = $state(true);
	let publicWorkspace = $state(false);
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Text input" hint="label / input / placeholder / hint">
		<FieldElement
			class="w-full max-w-sm"
			label="Email"
			input={{ type: 'email', name: 'demo-email' }}
			placeholder="you@company.com"
			hint="We only use it to sign you in."
		/>
	</Field>

	<Field label="Validation errors" hint="issues — replaces the hint and reddens the field">
		<FieldElement
			class="w-full max-w-sm"
			label="Email"
			input={{ type: 'email', name: 'demo-invalid', value: 'not-an-email' }}
			issues={[{ message: 'Please enter a valid email address' }]}
		/>
	</Field>

	<Field label="Your own control" hint="children snippet — select, textarea, input groups">
		<div class="grid w-full max-w-sm gap-2">
			<FieldElement label="Role">
				<select class="select" name="demo-role">
					<option>Admin</option>
					<option>Member</option>
					<option>Viewer</option>
				</select>
			</FieldElement>

			<FieldElement label="Bio" hint="Markdown is allowed.">
				<textarea class="textarea" name="demo-bio" rows="2" placeholder="A line about yourself"
				></textarea>
			</FieldElement>

			<!-- The snippet receives `invalid`, so a custom control can render in the
			     error state like the built-in input does. -->
			<FieldElement label="URL" issues={[{ message: 'This slug is taken' }]}>
				{#snippet children({ invalid })}
					<label class={['input', invalid && 'input-error']}>
						<span class="text-muted">tstack.app/</span>
						<input
							aria-label="Workspace URL"
							type="text"
							name="demo-slug"
							value="acme"
							class="grow"
						/>
					</label>
				{/snippet}
			</FieldElement>
		</div>
	</Field>

	<Field label="Switch" hint="label / description / bind:checked">
		<div class="w-full max-w-sm divide-y divide-base-300">
			<Switch
				bind:checked={notify}
				label="Mentions"
				description="Someone mentions you in a task or comment."
			/>
			<Switch
				bind:checked={publicWorkspace}
				label="Public workspace"
				description="Anyone with the link can read it without signing in."
			/>
			<Switch label="Audit log" description="Available on the Enterprise plan." disabled />
		</div>
	</Field>
</div>
