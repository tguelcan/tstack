<script lang="ts">
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import Field from './Field.svelte';
</script>

<div class="not-prose flex flex-col gap-4">
	<Field label="Title and description" hint="title / description">
		<Card
			title="Workspace"
			description="Everything your team shares lives in here."
			class="w-full max-w-md"
		>
			<p class="text-sm">The body takes any content — text, a list, a whole form.</p>
		</Card>
	</Field>

	<Field label="Header actions and footer" hint="actions / footer">
		<Card title="Plan" description="Team, renews 1 August" class="w-full max-w-md">
			{#snippet actions()}
				<Button color="ghost" size="sm" icon="MoreVerticalIcon" ariaLabel="Options" />
			{/snippet}

			<p class="text-sm">25 seats, 3 in use.</p>

			{#snippet footer()}
				<Button color="ghost" size="sm">Cancel</Button>
				<Button color="primary" size="sm">Save</Button>
			{/snippet}
		</Card>
	</Field>

	<Field label="Flush body" hint="flush — for tables that reach the border">
		<Card title="Members" icon="UserGroupIcon" flush class="w-full max-w-md">
			<table class="table table-sm">
				<tbody>
					<tr><td>Mara Lindqvist</td><td class="text-muted">Admin</td></tr>
					<tr><td>Jonas Weber</td><td class="text-muted">Member</td></tr>
				</tbody>
			</table>
		</Card>
	</Field>

	<Field label="Icon in the header" hint="icon">
		<Card title="Set-up" icon="RocketIcon" class="w-full max-w-md">
			<p class="text-sm">The icon sits in front of the title and inherits the tone.</p>
		</Card>
	</Field>

	<Field label="Destructive section" hint="tone — colours icon and border">
		<Card title="Danger zone" icon="Alert01Icon" tone="error" class="w-full max-w-md">
			<p class="text-sm">Used for delete and close-account sections, so they read the same way.</p>

			{#snippet footer()}
				<Button color="error" variant="outline" size="sm" icon="Delete02Icon">Delete</Button>
			{/snippet}
		</Card>
	</Field>
</div>
