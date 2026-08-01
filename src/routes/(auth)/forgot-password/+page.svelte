<script lang="ts">
	import PageTitle from '$components/layout/PageTitle.svelte';
	import { page } from '$app/state';
	import Alert from '$components/elements/Alert.svelte';
	import Button from '$components/elements/Button.svelte';
	import Field from '$components/elements/Field.svelte';
	import { rootIssues } from '$helper/form';
	import { requestPasswordReset } from '$remotes/auth.remote';
	import AuthHeader from '../AuthHeader.svelte';

	const sent = $derived(page.url.searchParams.has('sent'));
</script>

<PageTitle text="Reset password" />

<AuthHeader
	title="Forgot your password?"
	description="We'll email you a link to choose a new one."
/>

{#if sent}
	<!-- Same answer for every address, so this page cannot be used to find out
	     who has an account here. -->
	<Alert color="success" title="Check your inbox" class="mb-6">
		If an account exists for that address, the reset link is on its way.
	</Alert>
{/if}

<form {...requestPasswordReset} class="grid gap-2">
	<Field
		label="Email"
		input={requestPasswordReset.fields.email.as('email')}
		issues={requestPasswordReset.fields.email.issues()}
		placeholder="you@company.com"
	/>

	{#each rootIssues(requestPasswordReset.fields.allIssues()) as issue, index (index)}
		<Alert color="error" class="mt-2">{issue.message}</Alert>
	{/each}

	<Button color="primary" block class="mt-4">Send reset link</Button>
</form>

<p class="mt-8 text-center text-sm">
	<a href="/login" class="text-muted link">Back to sign in</a>
</p>
