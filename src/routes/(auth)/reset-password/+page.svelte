<script lang="ts">
	import { page } from '$app/state';
	import Alert from '$components/elements/Alert.svelte';
	import Button from '$components/elements/Button.svelte';
	import { rootIssues } from '$helper/form';
	import { resetPassword } from '$remotes/auth.remote';
	import AuthHeader from '../AuthHeader.svelte';
	import PasswordField from '../PasswordField.svelte';

	// The mail links here as `/reset-password?token=…`.
	const token = $derived(page.url.searchParams.get('token') ?? '');
</script>

<svelte:head><title>Choose a new password · tstack</title></svelte:head>

<AuthHeader title="Choose a new password" description="It has to be at least 8 characters long." />

{#if !token}
	<Alert color="warning" title="No token in this link" class="mb-6">
		Open the link from the email again, or
		<a href="/forgot-password" class="link">request a new one</a>.
	</Alert>
{/if}

<form {...resetPassword} class="grid gap-2">
	<input {...resetPassword.fields.token.as('hidden', token)} />

	<PasswordField
		label="New password"
		input={resetPassword.fields._password.as('password')}
		issues={resetPassword.fields._password.issues()}
	/>

	<PasswordField
		label="Repeat password"
		input={resetPassword.fields._confirmation.as('password')}
		issues={resetPassword.fields._confirmation.issues()}
	/>

	{#each rootIssues(resetPassword.fields.allIssues()) as issue, index (index)}
		<Alert color="error" class="mt-2">{issue.message}</Alert>
	{/each}

	<Button color="primary" block class="mt-4">Save password</Button>
</form>

<p class="mt-8 text-center text-sm">
	<a href="/login" class="text-muted link">Back to sign in</a>
</p>
