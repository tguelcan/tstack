<script lang="ts">
	import Alert from '$components/elements/Alert.svelte';
	import Avatar from '$components/elements/Avatar.svelte';
	import Badge from '$components/elements/Badge.svelte';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import Field from '$components/elements/Field.svelte';
	import { rootIssues } from '$helper/form';
	import {
		acceptInvitation,
		createOrganization,
		getMyInvitations,
		getMyOrganizations,
		rejectInvitation,
		switchOrganization
	} from '$remotes/organization.remote';

	const invitations = $derived(await getMyInvitations());
	const organizations = $derived(await getMyOrganizations());
</script>

<svelte:head><title>Set up your workspace · tstack</title></svelte:head>

<div class="mb-8">
	<h1 class="text-2xl font-semibold">Set up your workspace</h1>
	<p class="text-muted mt-1.5 text-sm">
		Everything in this app — tasks, members, settings — belongs to an organization. Join one, or
		start your own.
	</p>
</div>

<div class="grid gap-4">
	<!-- Invitations come first. Someone who was invited should not have to scroll
	     past a create form and end up with an organization of one by accident. -->
	{#if invitations.length > 0}
		<Card title="You were invited" description="Accepting takes you straight in." icon="Mail01Icon">
			<ul class="divide-y divide-base-300">
				{#each invitations as invitation (invitation.id)}
					{@const accept = acceptInvitation.for(invitation.id)}
					{@const reject = rejectInvitation.for(invitation.id)}
					<li class="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
						<Avatar
							name={invitation.organization.name}
							src={invitation.organization.logo}
							size={40}
						/>

						<div class="min-w-0 flex-1">
							<p class="flex items-center gap-2 font-medium">
								<span class="truncate">{invitation.organization.name}</span>
								{#if invitation.role}
									<Badge size="sm" variant="soft">{invitation.role}</Badge>
								{/if}
							</p>
							<p class="text-muted truncate text-sm">Invited by {invitation.inviter.name}</p>
						</div>

						<div class="flex gap-2">
							<form {...reject}>
								<input {...reject.fields.invitationId.as('hidden', invitation.id)} />
								<Button color="ghost" size="sm" loading={!!reject.pending}>Decline</Button>
							</form>

							<form {...accept}>
								<input {...accept.fields.invitationId.as('hidden', invitation.id)} />
								<Button color="primary" size="sm" loading={!!accept.pending}>Accept</Button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		</Card>
	{/if}

	<!-- Normally empty. You land here with organizations when the active one was
	     deleted or you were removed from it — and when you follow "New
	     organization" from the switcher, where opening an existing one instead is
	     a reasonable thing to want. -->
	{#if organizations.length > 0}
		<Card
			title="Your organizations"
			description="Pick up where you left off."
			icon="Building01Icon"
		>
			<ul class="divide-y divide-base-300">
				{#each organizations as organization (organization.id)}
					{@const submit = switchOrganization.for(organization.id)}
					<li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
						<Avatar name={organization.name} src={organization.logo} size={40} />

						<div class="min-w-0 flex-1">
							<p class="truncate font-medium">{organization.name}</p>
							<p class="text-muted truncate text-sm capitalize">{organization.role}</p>
						</div>

						<form {...submit}>
							<input {...submit.fields.organizationId.as('hidden', organization.id)} />
							<Button color="neutral" variant="outline" size="sm" loading={!!submit.pending}>
								Open
							</Button>
						</form>
					</li>
				{/each}
			</ul>
		</Card>
	{/if}

	<!-- `enctype` is required for the logo: without it the browser submits the file
	     name instead of the file, and only on the path without JavaScript — which
	     is exactly the kind of difference that goes unnoticed. -->
	<form {...createOrganization} enctype="multipart/form-data">
		<Card
			title="Create an organization"
			description="You can rename it and invite people later."
			icon="RocketIcon"
		>
			<div class="grid gap-2">
				<Field
					label="Name"
					input={createOrganization.fields.name.as('text')}
					issues={createOrganization.fields.name.issues()}
					placeholder="Acme Inc."
				/>

				<!-- Optional on purpose. The server derives it from the name when it is
				     left empty, which keeps this identical with and without JavaScript
				     instead of relying on a keystroke handler to fill it in. -->
				<Field
					label="Address"
					issues={createOrganization.fields.slug.issues()}
					hint="Used in links and invitations. Leave it empty to build one from the name."
				>
					{#snippet children({ invalid })}
						<label class={['input', invalid && 'input-error']}>
							<span class="text-muted">tstack.app/</span>
							<input
								aria-label="Organization address"
								{...createOrganization.fields.slug.as('text')}
								placeholder="acme"
								class="grow"
							/>
						</label>
					{/snippet}
				</Field>

				<Field
					label="Logo"
					issues={createOrganization.fields.logo.issues()}
					hint="Optional. Square works best — anything else is padded to fit."
				>
					<input
						aria-label="Logo"
						{...createOrganization.fields.logo.as('file')}
						accept="image/*"
						class="file-input w-full"
					/>
				</Field>
			</div>

			{#each rootIssues(createOrganization.fields.allIssues()) as issue, index (index)}
				<Alert color="error" class="mt-3">{issue.message}</Alert>
			{/each}

			{#snippet footer()}
				<Button color="primary" icon="PlusSignIcon" loading={!!createOrganization.pending}>
					Create organization
				</Button>
			{/snippet}
		</Card>
	</form>
</div>
