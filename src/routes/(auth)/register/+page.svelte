<script lang="ts">
	import PageTitle from '$components/layout/PageTitle.svelte';
	import Alert from '$components/elements/Alert.svelte';
	import Button from '$components/elements/Button.svelte';
	import Field from '$components/elements/Field.svelte';
	import { rootIssues } from '$helper/form';
	import { register } from '$remotes/auth.remote';
	import AuthHeader from '../AuthHeader.svelte';
	import PasswordField from '../PasswordField.svelte';
	import SocialSignIn from '../SocialSignIn.svelte';
</script>

<PageTitle text="Create account" />

<AuthHeader title="Create your account" description="Free to start, no card required." />

<SocialSignIn action="sign up" />

<form {...register} class="grid gap-2">
	<Field
		label="Name"
		input={register.fields.name.as('text')}
		issues={register.fields.name.issues()}
		placeholder="Jane Doe"
	/>

	<Field
		label="Email"
		input={register.fields.email.as('email')}
		issues={register.fields.email.issues()}
		placeholder="you@company.com"
	/>

	<PasswordField
		label="Password"
		input={register.fields._password.as('password')}
		issues={register.fields._password.issues()}
		hint="At least 8 characters."
	/>

	<label class="mt-1 flex cursor-pointer items-start gap-2 text-sm">
		<input {...register.fields.terms.as('checkbox')} class="checkbox mt-0.5 checkbox-sm" />
		<span>
			I agree to the
			<a href="/terms" class="link">terms</a>
			and the
			<a href="/privacy" class="link">privacy policy</a>.
		</span>
	</label>

	{#each register.fields.terms.issues() ?? [] as issue, index (index)}
		<p class="label text-error">{issue.message}</p>
	{/each}

	{#each rootIssues(register.fields.allIssues()) as issue, index (index)}
		<Alert color="error" class="mt-2">{issue.message}</Alert>
	{/each}

	<Button color="primary" block class="mt-4" loading={!!register.pending}>Create account</Button>
</form>

<p class="text-muted mt-8 text-center text-sm">
	Already have an account?
	<a href="/login" class="link">Sign in</a>
</p>
