<script lang="ts">
	import Alert from '$components/elements/Alert.svelte';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import Switch from '$components/elements/Switch.svelte';
	import { rootIssues } from '$helper/form';
	import { getAccount, updateNotificationSettings } from '$remotes/account.remote';

	const account = $derived(await getAccount());
	const settings = $derived(account.notifications);

	const fields = $derived(updateNotificationSettings.fields);
</script>

<svelte:head><title>Notifications · tstack</title></svelte:head>

<!--
	One form around both cards, so "Save preferences" saves everything on the page
	rather than only the group it happens to sit above. Each switch takes the
	attribute bag rather than a plain `name`: a remote form's field names carry the
	form's id, and a hand-written `name` would submit something the server never
	reads. An unchecked box sends nothing at all, which is why every field in the
	schema defaults to `false`.
-->
<form {...updateNotificationSettings} class="grid gap-4">
	<Card title="Email" description="What lands in your inbox.">
		<div class="divide-y divide-base-300">
			<Switch
				input={fields.mentions.as('checkbox', settings.mentions)}
				label="Mentions"
				description="Someone mentions you in a task or comment."
			/>
			<Switch
				input={fields.assignments.as('checkbox', settings.assignments)}
				label="Assignments"
				description="A task is assigned to you."
			/>
			<Switch
				input={fields.weeklyDigest.as('checkbox', settings.weeklyDigest)}
				label="Weekly digest"
				description="A Monday summary of what happened in the organization."
			/>
			<Switch
				input={fields.productUpdates.as('checkbox', settings.productUpdates)}
				label="Product updates"
				description="Occasional news about new features."
			/>
		</div>

		{#each rootIssues(fields.allIssues()) as issue, index (index)}
			<Alert color="error" class="mt-3">{issue.message}</Alert>
		{/each}

		{#snippet footer()}
			<Button color="primary" loading={!!updateNotificationSettings.pending}>
				Save preferences
			</Button>
		{/snippet}
	</Card>

	<Card title="Desktop">
		<Switch
			input={fields.desktop.as('checkbox', settings.desktop)}
			label="Browser notifications"
			description="Requires permission from your browser."
		/>
	</Card>
</form>
