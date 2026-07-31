<script lang="ts">
	import { page } from '$app/state';
	import Alert from '$components/elements/Alert.svelte';
	import Avatar from '$components/elements/Avatar.svelte';
	import Badge from '$components/elements/Badge.svelte';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import Field from '$components/elements/Field.svelte';
	import Modal from '$components/elements/Modal.svelte';
	import PageHeader from '$components/layout/PageHeader.svelte';
	import { rootIssues } from '$helper/form';
	import {
		changeEmail,
		deleteAccount,
		getAccount,
		removeAvatar,
		updateProfile,
		uploadAvatar
	} from '$remotes/account.remote';

	const account = $derived(await getAccount());

	// Every zone the runtime knows about, rather than a hand-picked handful —
	// there is no defensible way to choose four of them for everybody.
	const timezones = Intl.supportedValuesOf('timeZone');

	const emailSent = $derived(page.url.searchParams.has('email-sent'));
	const deleteSent = $derived(page.url.searchParams.has('delete-sent'));

	let confirmation = $state('');

	const confirmed = $derived(
		confirmation.trim().toLowerCase() === account.user.email.toLowerCase()
	);
</script>

<svelte:head><title>Profile · tstack</title></svelte:head>

<PageHeader title="Profile" description="How you appear to the rest of the workspace." />

<div class="grid gap-4">
	{#if deleteSent}
		<Alert color="warning" title="Check your inbox">
			We sent a link that finishes deleting your account. Nothing has happened yet.
		</Alert>
	{/if}

	<Card title="Photo" description="A square image works best.">
		<div class="flex flex-wrap items-center gap-5">
			<Avatar name={account.user.name} src={account.user.image} size={72} />

			<div class="grid gap-1.5">
				<div class="flex flex-wrap items-center gap-2">
					<!-- `enctype` is required: without it the browser submits the file name
					     instead of the file, and only on the path without JavaScript.
					     Choosing a file is the whole gesture — `onchange` submits right
					     away, so there is no separate upload button. -->
					<form {...uploadAvatar} enctype="multipart/form-data">
						<input
							aria-label="New photo"
							{...uploadAvatar.fields.image.as('file')}
							accept="image/*"
							class="file-input file-input-sm"
							disabled={!!uploadAvatar.pending}
							onchange={(event) => event.currentTarget.form?.requestSubmit()}
						/>
					</form>

					{#if account.user.image}
						<form {...removeAvatar}>
							<Button color="ghost" size="sm" icon="Delete02Icon" loading={!!removeAvatar.pending}>
								Remove
							</Button>
						</form>
					{/if}
				</div>

				{#each uploadAvatar.fields.image.issues() ?? [] as issue, index (index)}
					<p class="text-sm text-error">{issue.message}</p>
				{/each}
			</div>
		</div>
	</Card>

	<form {...updateProfile}>
		<Card title="Details">
			<div class="grid gap-2 sm:grid-cols-2">
				<Field
					label="Name"
					class="sm:col-span-2"
					input={updateProfile.fields.name.as('text', account.user.name)}
					issues={updateProfile.fields.name.issues()}
				/>

				<Field
					label="Bio"
					class="sm:col-span-2"
					issues={updateProfile.fields.bio.issues()}
					hint="Shown to the other members of your organizations."
				>
					<textarea
						aria-label="Bio"
						{...updateProfile.fields.bio.as('text')}
						rows="3"
						placeholder="A line about yourself"
						class="textarea w-full">{account.user.bio ?? ''}</textarea
					>
				</Field>

				<Field
					label="Time zone"
					class="sm:col-span-2"
					issues={updateProfile.fields.timezone.issues()}
					hint="Dates and times across the app are shown in this zone."
				>
					<select
						{...updateProfile.fields.timezone.as('select', account.user.timezone ?? '')}
						class="select"
					>
						<option value="">Use the server's zone</option>
						{#each timezones as zone (zone)}
							<option value={zone}>{zone}</option>
						{/each}
					</select>
				</Field>
			</div>

			{#each rootIssues(updateProfile.fields.allIssues()) as issue, index (index)}
				<Alert color="error" class="mt-3">{issue.message}</Alert>
			{/each}

			{#snippet footer()}
				<Button color="primary" loading={!!updateProfile.pending}>Save changes</Button>
			{/snippet}
		</Card>
	</form>

	<form {...changeEmail}>
		<Card title="Email address" description="Used to sign in and to reach you.">
			<div class="mb-4 flex flex-wrap items-center gap-2">
				<span class="font-medium">{account.user.email}</span>
				{#if account.user.emailVerified}
					<Badge size="sm" variant="soft" color="success">Confirmed</Badge>
				{:else}
					<Badge size="sm" variant="soft" color="warning">Not confirmed</Badge>
				{/if}
			</div>

			{#if emailSent}
				<Alert color="success" title="Check your current inbox" class="mb-3">
					The change takes effect once you approve it from your old address.
				</Alert>
			{/if}

			<Field
				label="New address"
				input={changeEmail.fields.newEmail.as('email')}
				issues={changeEmail.fields.newEmail.issues()}
				placeholder="you@company.com"
				hint="We ask your current address to approve the change first."
			/>

			{#each rootIssues(changeEmail.fields.allIssues()) as issue, index (index)}
				<Alert color="error" class="mt-3">{issue.message}</Alert>
			{/each}

			{#snippet footer()}
				<Button color="neutral" variant="outline" loading={!!changeEmail.pending}>
					Change email
				</Button>
			{/snippet}
		</Card>
	</form>

	<Card title="Close account" icon="Alert01Icon" tone="error">
		<p class="text-sm">
			Closing your account removes your profile and your memberships. Organizations where you are
			the only owner have to be deleted first, in their settings.
		</p>

		{#each rootIssues(deleteAccount.fields.allIssues()) as issue, index (index)}
			<Alert color="error" class="mt-3">{issue.message}</Alert>
		{/each}

		{#snippet footer()}
			<Button
				type="button"
				command="show-modal"
				commandfor="close-account"
				color="error"
				variant="outline"
				icon="Logout01Icon"
			>
				Close account
			</Button>
		{/snippet}
	</Card>
</div>

<!--
	Typing the address is the point: closing an account is irreversible, and a
	plain "are you sure" is dismissed on reflex. The button stays disabled until
	the confirmation matches — and because that check only exists in the browser,
	`deleteAccount` repeats it on the server. Even then nothing is deleted until
	the link in the confirmation mail is opened.
-->
<Modal
	id="close-account"
	title="Close this account?"
	description="We send a confirmation link first. Opening it cannot be undone."
	cancelLabel="Keep my account"
>
	<form {...deleteAccount} id="close-account-form">
		<Field
			label="Type {account.user.email} to confirm"
			issues={deleteAccount.fields.confirmation.issues()}
		>
			<input
				aria-label="Confirm your email address"
				{...deleteAccount.fields.confirmation.as('text')}
				bind:value={confirmation}
				class="input"
				placeholder={account.user.email}
				autocomplete="off"
			/>
		</Field>
	</form>

	{#snippet actions()}
		<!-- The dialog lives in the top layer, which takes this button out of the
		     form's DOM subtree — `form` is what puts it back. -->
		<Button
			form="close-account-form"
			color="error"
			icon="Delete02Icon"
			disabled={!confirmed}
			loading={!!deleteAccount.pending}
		>
			Send confirmation link
		</Button>
	{/snippet}
</Modal>
