<script lang="ts">
	import { page } from '$app/state';
	import type { RouteParams } from '$app/types';
	import Alert from '$components/elements/Alert.svelte';
	import Avatar from '$components/elements/Avatar.svelte';
	import Badge from '$components/elements/Badge.svelte';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import EmptyState from '$components/elements/EmptyState.svelte';
	import { rootIssues } from '$helper/form';
	import { acceptInvitation, getInvitation, rejectInvitation } from '$remotes/organization.remote';

	const params = $derived(page.params as RouteParams<'/(onboarding)/accept-invitation/[id]'>);
	const invitation = $derived(await getInvitation(params.id));

	const accept = $derived(acceptInvitation.for(params.id));
	const reject = $derived(rejectInvitation.for(params.id));

	const open = $derived(invitation?.status === 'pending' && invitation.expiresAt > new Date());
</script>

<svelte:head><title>Invitation · tstack</title></svelte:head>

<!--
	The page the link in the invitation email lands on. `getInvitation` answers
	`null` for anything that is not addressed to the signed-in account, so a
	guessed id is indistinguishable from an expired one.
-->
{#if !invitation}
	<Card>
		<EmptyState
			class="border-0"
			icon="Mail01Icon"
			title="This invitation is not available"
			description="It may have been withdrawn, already used, or sent to a different address. Ask whoever invited you to send a new one."
		>
			{#snippet action()}
				<Button href="/onboarding" color="neutral" variant="outline">Continue without it</Button>
			{/snippet}
		</EmptyState>
	</Card>
{:else}
	<Card>
		<div class="flex flex-col items-center gap-4 py-4 text-center">
			<Avatar name={invitation.organization.name} src={invitation.organization.logo} size={64} />

			<div>
				<h1 class="text-xl font-semibold">Join {invitation.organization.name}</h1>
				<p class="text-muted mt-1.5 text-sm">
					{invitation.inviter.name} ({invitation.inviter.email}) invited you
					{#if invitation.role}
						as <Badge size="sm" variant="soft">{invitation.role}</Badge>
					{/if}
				</p>
			</div>

			{#if !open}
				<Alert color="warning" title="This invitation is no longer open" class="text-left">
					It has expired or has already been answered.
				</Alert>
			{/if}

			{#each rootIssues(accept.fields.allIssues()) as issue, index (index)}
				<Alert color="error" class="text-left">{issue.message}</Alert>
			{/each}

			<div class="flex flex-wrap justify-center gap-2">
				<form {...reject}>
					<input {...reject.fields.invitationId.as('hidden', invitation.id)} />
					<Button color="ghost" disabled={!open} loading={!!reject.pending}>Decline</Button>
				</form>

				<form {...accept}>
					<input {...accept.fields.invitationId.as('hidden', invitation.id)} />
					<Button color="primary" disabled={!open} loading={!!accept.pending}>
						Accept invitation
					</Button>
				</form>
			</div>
		</div>
	</Card>
{/if}
