<script lang="ts">
	import Avatar from '$components/elements/Avatar.svelte';
	import Badge from '$components/elements/Badge.svelte';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import DataTable from '$components/elements/DataTable.svelte';
	import EmptyState from '$components/elements/EmptyState.svelte';
	import StatCard from '$components/elements/StatCard.svelte';
	import PageHeader from '$components/layout/PageHeader.svelte';
	import { activity, dashboardStats } from '$helper/demo';
</script>

<svelte:head><title>Dashboard · tstack</title></svelte:head>

<PageHeader title="Dashboard" description="What happened in your workspace this week.">
	{#snippet actions()}
		<Button href="/crud/new" color="primary" icon="PlusSignIcon" block="responsive">
			New task
		</Button>
	{/snippet}
</PageHeader>

<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	{#each dashboardStats as stat (stat.label)}
		<StatCard
			label={stat.label}
			value={stat.value}
			delta={stat.delta}
			icon={stat.icon}
			hint="vs. last month"
		/>
	{/each}
</div>

<div class="mt-4 grid gap-4 lg:grid-cols-3">
	<Card
		title="Recent activity"
		icon="Clock01Icon"
		description="The last few changes in this workspace"
		class="self-start lg:col-span-2"
		flush
	>
		{#snippet actions()}
			<Button href="/crud" color="ghost" size="sm" arrowRight>All tasks</Button>
		{/snippet}

		<DataTable
			columns={[{ label: 'Who' }, { label: 'What' }, { label: 'When' }]}
			rows={activity}
			key={(entry) => entry.id}
		>
			{#snippet row(entry)}
				<td>
					<div class="flex items-center gap-3">
						<Avatar name={entry.actor} size={32} />
						<span class="font-medium whitespace-nowrap">{entry.actor}</span>
					</div>
				</td>
				<td>{entry.action}</td>
				<td class="text-muted whitespace-nowrap">{entry.at}</td>
			{/snippet}
		</DataTable>
	</Card>

	<div class="grid content-start gap-4">
		<Card title="Set-up" icon="RocketIcon" description="Two steps left before you go live">
			<ul class="space-y-3 text-sm">
				<li class="flex items-center gap-2.5">
					<Badge color="success" variant="soft" size="sm" icon="Tick02Icon">Done</Badge>
					Workspace created
				</li>
				<li class="flex items-center gap-2.5">
					<Badge color="warning" variant="soft" size="sm">Open</Badge>
					Invite your team
				</li>
				<li class="flex items-center gap-2.5">
					<Badge color="warning" variant="soft" size="sm">Open</Badge>
					Add a payment method
				</li>
			</ul>

			{#snippet footer()}
				<Button href="/team" color="neutral" size="sm">Invite people</Button>
			{/snippet}
		</Card>

		<Card title="Reports">
			<EmptyState
				icon="ChartLineData01Icon"
				title="No reports yet"
				description="Reports appear once this workspace has collected a week of data."
			/>
		</Card>
	</div>
</div>
