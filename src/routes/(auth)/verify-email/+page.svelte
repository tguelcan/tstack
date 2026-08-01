<script lang="ts">
	import PageTitle from '$components/layout/PageTitle.svelte';
	import { page } from '$app/state';
	import Alert from '$components/elements/Alert.svelte';
	import Button from '$components/elements/Button.svelte';
	import Field from '$components/elements/Field.svelte';
	import { rootIssues } from '$helper/form';
	import { resendVerification } from '$remotes/auth.remote';
	import AuthHeader from '../AuthHeader.svelte';

	const sent = $derived(page.url.searchParams.has('sent'));
</script>

<PageTitle text="Confirm your email" />

<AuthHeader
	title="Confirm your email"
	description="We sent you a link. Open it and your account is ready."
/>

{#if sent}
	<!-- Same answer for every address, so this page cannot be used to find out
	     who has an account here. -->
	<Alert color="success" title="On its way" class="mb-6">
		If that address needs confirming, a new link is in the inbox.
	</Alert>
{/if}

<Alert color="info" class="mb-6">
	Until the address is confirmed, signing in will not work. The link is only valid for an hour.
</Alert>

<form {...resendVerification} class="grid gap-2">
	<Field
		label="Email"
		input={resendVerification.fields.email.as('email')}
		issues={resendVerification.fields.email.issues()}
		placeholder="you@company.com"
		hint="Nothing arrived? Enter the address again and we'll send another link."
	/>

	{#each rootIssues(resendVerification.fields.allIssues()) as issue, index (index)}
		<Alert color="error" class="mt-2">{issue.message}</Alert>
	{/each}

	<Button
		color="neutral"
		variant="outline"
		block
		class="mt-4"
		icon="Mail01Icon"
		loading={!!resendVerification.pending}
	>
		Send another link
	</Button>
</form>

<p class="mt-8 text-center text-sm">
	<a href="/login" class="text-muted link">Back to sign in</a>
</p>
