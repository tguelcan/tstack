<script lang="ts">
	import PageTitle from '$components/layout/PageTitle.svelte';
	import Alert from '$components/elements/Alert.svelte';
	import Badge from '$components/elements/Badge.svelte';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import EmptyState from '$components/elements/EmptyState.svelte';
	import Icon from '$components/elements/Icon.svelte';
	import PasswordField from '../../../(auth)/PasswordField.svelte';
	import { rootIssues } from '$helper/form';
	import { describeUserAgent, formatDateTime } from '$helper/format';
	import {
		changePassword,
		getAccount,
		getSessions,
		revokeOtherSessions,
		revokeSession,
		unlinkAccount
	} from '$remotes/account.remote';
	import { getAuthProviders } from '$remotes/auth.remote';

	const account = $derived(await getAccount());
	const sessions = $derived(await getSessions());
	const available = $derived(await getAuthProviders());

	const brands: Record<string, string> = { google: 'Google', github: 'GitHub' };

	const connected = $derived(new Set(account.providers.map((provider) => provider.providerId)));

	// Only one device is signed in, and it is the one reading this page.
	const others = $derived(sessions.filter((session) => !session.current));
</script>

<PageTitle text="Security" />

<div class="grid gap-4">
	{#if account.hasPassword}
		<form {...changePassword}>
			<Card title="Password" description="Choose something you do not use anywhere else.">
				<div class="grid max-w-sm gap-2">
					<PasswordField
						label="Current password"
						input={changePassword.fields._current.as('password')}
						issues={changePassword.fields._current.issues()}
					/>

					<PasswordField
						label="New password"
						input={changePassword.fields._password.as('password')}
						issues={changePassword.fields._password.issues()}
					/>

					<PasswordField
						label="Repeat new password"
						input={changePassword.fields._confirmation.as('password')}
						issues={changePassword.fields._confirmation.issues()}
					/>

					<label class="mt-1 flex cursor-pointer items-center gap-2 text-sm">
						<input
							{...changePassword.fields.revokeOthers.as('checkbox', true)}
							class="checkbox checkbox-sm"
						/>
						Sign out my other devices
					</label>
				</div>

				{#each rootIssues(changePassword.fields.allIssues()) as issue, index (index)}
					<Alert color="error" class="mt-3">{issue.message}</Alert>
				{/each}

				{#snippet footer()}
					<Button color="primary" icon="Key01Icon" loading={!!changePassword.pending}>
						Change password
					</Button>
				{/snippet}
			</Card>
		</form>
	{:else}
		<Card title="Password" description="This account signs in through a provider.">
			<p class="text-sm">
				There is no password on this account yet. Setting one goes through your inbox, the same way
				a reset does — that way nobody who borrows an open session can add one silently.
			</p>

			{#snippet footer()}
				<Button href="/forgot-password" color="neutral" variant="outline" icon="Key01Icon">
					Set a password by email
				</Button>
			{/snippet}
		</Card>
	{/if}

	{#if available.length > 0}
		<Card title="Connected accounts" description="Other ways to sign in.">
			<ul class="divide-y divide-base-300">
				{#each available as provider (provider)}
					{@const linked = connected.has(provider)}
					{@const unlink = unlinkAccount.for(provider)}
					<li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
						<span class="text-base-content/60">
							<Icon name={provider === 'google' ? 'GoogleIcon' : 'GithubIcon'} size={20} />
						</span>

						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium">{brands[provider] ?? provider}</p>
							<p class="text-muted text-xs">
								{linked ? 'Connected' : 'Not connected'}
							</p>
						</div>

						{#if linked}
							<form {...unlink}>
								<input {...unlink.fields.providerId.as('hidden', provider)} />
								<Button color="ghost" size="sm" loading={!!unlink.pending}>Disconnect</Button>
							</form>
						{:else}
							<!-- Signing in with the provider links it, because
							     `accountLinking` trusts both of them for a matching address. -->
							<Button href="/login" color="ghost" size="sm">Connect</Button>
						{/if}
					</li>
				{/each}
			</ul>

			{#each rootIssues(unlinkAccount.fields.allIssues()) as issue, index (index)}
				<Alert color="error" class="mt-3">{issue.message}</Alert>
			{/each}
		</Card>
	{/if}

	<Card title="Active sessions" description="Signed in on these devices.">
		{#if sessions.length === 0}
			<EmptyState
				class="border-0"
				icon="SquareLock01Icon"
				title="No other sessions"
				description="Only this device is signed in."
			/>
		{:else}
			<ul class="divide-y divide-base-300">
				{#each sessions as session (session.token)}
					{@const revoke = revokeSession.for(session.token)}
					<li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
						<span class="text-base-content/40"><Icon name="SquareLock01Icon" size={20} /></span>

						<div class="min-w-0 flex-1">
							<p class="flex items-center gap-2 text-sm font-medium">
								<span class="truncate">{describeUserAgent(session.userAgent)}</span>
								{#if session.current}
									<Badge color="success" variant="soft" size="sm">This device</Badge>
								{/if}
							</p>
							<p class="text-muted text-xs">
								{session.ipAddress ?? 'Unknown address'} · since {formatDateTime(
									session.createdAt,
									account.user.timezone
								)}
							</p>
						</div>

						{#if !session.current}
							<form {...revoke}>
								<input {...revoke.fields.token.as('hidden', session.token)} />
								<Button color="ghost" size="sm" loading={!!revoke.pending}>Revoke</Button>
							</form>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#each rootIssues(revokeSession.fields.allIssues()) as issue, index (index)}
			<Alert color="error" class="mt-3">{issue.message}</Alert>
		{/each}

		{#snippet footer()}
			<form {...revokeOtherSessions}>
				<Button
					color="error"
					variant="outline"
					size="sm"
					disabled={others.length === 0}
					loading={!!revokeOtherSessions.pending}
				>
					Sign out everywhere else
				</Button>
			</form>
		{/snippet}
	</Card>
</div>
