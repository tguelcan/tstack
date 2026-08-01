<script lang="ts">
	import PageTitle from '$components/layout/PageTitle.svelte';
	import { page } from '$app/state';
	import Alert from '$components/elements/Alert.svelte';
	import Button from '$components/elements/Button.svelte';
	import Field from '$components/elements/Field.svelte';
	import { rootIssues } from '$helper/form';
	import { login } from '$remotes/auth.remote';
	import AuthHeader from '../AuthHeader.svelte';
	import PasswordField from '../PasswordField.svelte';
	import SocialSignIn from '../SocialSignIn.svelte';

	// Set by `resetPassword` after a successful change.
	const justReset = $derived(page.url.searchParams.has('reset'));

	// Set by `hooks.server.ts` when a signed-out visitor asked for a page behind
	// the login. Signing in then finishes the navigation they started.
	const redirectTo = $derived(page.url.searchParams.get('redirectTo') ?? undefined);
</script>

<PageTitle text="Sign in" />

<AuthHeader title="Welcome back" description="Sign in to continue to your workspace." />

{#if justReset}
	<Alert color="success" title="Password changed" class="mb-6">
		Sign in with your new password.
	</Alert>
{/if}

<SocialSignIn action="sign in" {redirectTo} />

<!-- `{...login}` supplies `method`/`action`, which works without JavaScript, plus
     an attachment that progressively enhances the submission. -->
<form {...login} class="grid gap-2">
	{#if redirectTo}
		<input {...login.fields.redirectTo.as('hidden', redirectTo)} />
	{/if}

	<Field
		label="Email"
		input={login.fields.email.as('email')}
		issues={login.fields.email.issues()}
		placeholder="you@company.com"
	/>

	<PasswordField
		label="Password"
		input={login.fields._password.as('password')}
		issues={login.fields._password.issues()}
	/>

	<div class="mt-1 flex items-center justify-between gap-4">
		<label class="flex cursor-pointer items-center gap-2 text-sm">
			<input {...login.fields.remember.as('checkbox')} class="checkbox checkbox-sm" />
			Remember me
		</label>

		<a href="/forgot-password" class="link text-sm">Forgot password?</a>
	</div>

	{#each rootIssues(login.fields.allIssues()) as issue, index (index)}
		<Alert color="error" class="mt-2">{issue.message}</Alert>
	{/each}

	<Button color="primary" block class="mt-4" loading={!!login.pending}>Sign in</Button>
</form>

<p class="text-muted mt-8 text-center text-sm">
	No account yet?
	<a href="/register" class="link">Create one</a>
</p>
