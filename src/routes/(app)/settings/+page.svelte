<script lang="ts">
	import Alert from '$components/elements/Alert.svelte';
	import Avatar from '$components/elements/Avatar.svelte';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import Field from '$components/elements/Field.svelte';
	import Modal from '$components/elements/Modal.svelte';
	import { rootIssues } from '$helper/form';
	import {
		deleteOrganization,
		getWorkspace,
		updateOrganization
	} from '$remotes/organization.remote';

	const workspace = $derived(await getWorkspace());

	const canEdit = $derived(workspace.role === 'owner' || workspace.role === 'admin');
	const canDelete = $derived(workspace.role === 'owner');

	let confirmation = $state('');

	const confirmed = $derived(
		confirmation.trim().toLowerCase() === workspace.organization.slug.toLowerCase()
	);
</script>

<svelte:head><title>Settings · tstack</title></svelte:head>

<div class="grid gap-4">
	{#if !canEdit}
		<Alert color="info" title="You are a member of this organization">
			Only owners and admins can change these settings.
		</Alert>
	{/if}

	<!-- `enctype` is required for the logo: without it the browser submits the file
	     name instead of the file, and only on the path without JavaScript. -->
	<form {...updateOrganization} enctype="multipart/form-data">
		<Card
			title="Organization"
			description="Its name and address are visible to everyone you invite."
		>
			<div class="mb-4 flex flex-wrap items-center gap-4">
				<Avatar name={workspace.organization.name} src={workspace.organization.logo} size={56} />

				<Field
					label="Logo"
					class="flex-1"
					issues={updateOrganization.fields.logo.issues()}
					hint="Square works best — anything else is padded to fit."
				>
					<input
						aria-label="Logo"
						{...updateOrganization.fields.logo.as('file')}
						accept="image/*"
						class="file-input w-full"
						disabled={!canEdit}
					/>
				</Field>
			</div>

			{#if workspace.organization.logo}
				<label class="mb-4 flex w-fit cursor-pointer items-center gap-2 text-sm">
					<input
						{...updateOrganization.fields.removeLogo.as('checkbox')}
						class="checkbox checkbox-sm"
						disabled={!canEdit}
					/>
					Remove the current logo
				</label>
			{/if}

			<div class="grid gap-2 sm:grid-cols-2">
				<Field
					label="Name"
					input={updateOrganization.fields.name.as('text', workspace.organization.name)}
					issues={updateOrganization.fields.name.issues()}
				/>

				<Field
					label="Address"
					issues={updateOrganization.fields.slug.issues()}
					hint="Used in links and invitations."
				>
					{#snippet children({ invalid })}
						<label class={['input', invalid && 'input-error']}>
							<span class="text-muted">tstack.app/</span>
							<input
								aria-label="Organization address"
								{...updateOrganization.fields.slug.as('text', workspace.organization.slug)}
								class="grow"
								disabled={!canEdit}
							/>
						</label>
					{/snippet}
				</Field>
			</div>

			{#each rootIssues(updateOrganization.fields.allIssues()) as issue, index (index)}
				<Alert color="error" class="mt-3">{issue.message}</Alert>
			{/each}

			{#snippet footer()}
				<Button color="primary" disabled={!canEdit} loading={!!updateOrganization.pending}>
					Save changes
				</Button>
			{/snippet}
		</Card>
	</form>

	<Card title="Danger zone" icon="Alert01Icon" tone="error">
		<p class="text-sm">
			Deleting {workspace.organization.name} removes every task, member and invitation in it. This cannot
			be undone.
		</p>

		{#if !canDelete}
			<Alert color="info" class="mt-3">Only an owner can delete this organization.</Alert>
		{/if}

		{#each rootIssues(deleteOrganization.fields.allIssues()) as issue, index (index)}
			<Alert color="error" class="mt-3">{issue.message}</Alert>
		{/each}

		{#snippet footer()}
			<Button
				type="button"
				command="show-modal"
				commandfor="delete-organization"
				color="error"
				variant="outline"
				icon="Delete02Icon"
				disabled={!canDelete}
			>
				Delete organization
			</Button>
		{/snippet}
	</Card>
</div>

<!--
	Typing the address is the point: a plain "are you sure" is dismissed on
	reflex. The button stays disabled until it matches — and because that check
	only exists in the browser, `deleteOrganization` repeats it on the server.
-->
<Modal
	id="delete-organization"
	title="Delete {workspace.organization.name}?"
	description="Everything in this organization goes with it. This cannot be undone."
	cancelLabel="Keep it"
>
	<form {...deleteOrganization} id="delete-organization-form">
		<Field
			label="Type {workspace.organization.slug} to confirm"
			issues={deleteOrganization.fields.confirmation.issues()}
		>
			<input
				aria-label="Confirm the organization address"
				{...deleteOrganization.fields.confirmation.as('text')}
				bind:value={confirmation}
				class="input"
				placeholder={workspace.organization.slug}
				autocomplete="off"
			/>
		</Field>
	</form>

	{#snippet actions()}
		<!-- The dialog lives in the top layer, which takes this button out of the
		     form's DOM subtree — `form` is what puts it back. -->
		<Button
			form="delete-organization-form"
			color="error"
			icon="Delete02Icon"
			disabled={!confirmed}
			loading={!!deleteOrganization.pending}
		>
			Delete organization
		</Button>
	{/snippet}
</Modal>
