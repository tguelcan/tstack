<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import DataTable from '$components/elements/DataTable.svelte';
	import EmptyState from '$components/elements/EmptyState.svelte';
	import ListToolbar from '$components/elements/ListToolbar.svelte';
	import LoadMore from '$components/elements/LoadMore.svelte';
	import PageHeader from '$components/layout/PageHeader.svelte';
	import { rootIssues } from '$helper/form';
	import { formatDateTime } from '$helper/format';
	import { taskColumns, taskList, taskStatusLabels } from '$helper/task';
	import { getWorkspace } from '$remotes/organization.remote';
	import { getTasks, toggleTask } from '$remotes/task.remote';

	// The whole list state lives in the URL, not in component state. That is what
	// makes filtering, sorting and "load more" work without JavaScript, and turns
	// every state into a shareable link.
	const params = $derived(taskList.parse(page.url));

	// The organization id is part of the query argument so the client-side cache
	// is keyed by it. Without it, switching organizations would show the previous
	// one's rows for the same filters. The server ignores the value and reads the
	// session instead — this is a cache key, not an authorization argument.
	const workspace = $derived(await getWorkspace());
	const tasks = $derived(await getTasks({ organizationId: workspace.organization.id, params }));

	// An empty list means two different things, and each needs its own way out:
	// nothing exists yet, or the current filters hide everything.
	const filtered = $derived(!!page.url.search);
</script>

<svelte:head><title>Tasks · tstack</title></svelte:head>

<PageHeader title="Tasks" description="Everything this workspace still has on its plate.">
	{#snippet actions()}
		<!-- Carries the list's query string, so the form knows where to return to —
		     filters, sorting and "load more" state survive the round trip. -->
		<Button
			href="/crud/new{page.url.search}"
			color="primary"
			icon="PlusSignIcon"
			block="responsive"
		>
			New task
		</Button>
	{/snippet}
</PageHeader>

<Card flush>
	<div class="border-b border-base-300 px-4 py-3 sm:px-5">
		<ListToolbar
			q={params.q}
			placeholder="Search descriptions…"
			filters={[
				{ name: 'status', label: 'Status', value: params.status, options: taskStatusLabels }
			]}
		/>
	</div>

	<!-- While the next page loads, Svelte keeps the previous table on screen, so
	     there is no layout jump. Deliberately no `$effect.pending()` dimming here:
	     called from a template expression it throws `state_unsafe_mutation` as soon
	     as other async work is in flight, which aborts the entire client-side
	     navigation into this page. -->
	<DataTable
		columns={taskColumns}
		rows={tasks.items}
		key={(task) => task.id}
		sort={{
			field: params.sort,
			dir: params.dir,
			href: (field) => taskList.sortHref(page.url, field)
		}}
		rowId={(task) => `task-${task.id}`}
	>
		{#snippet row(task)}
			{@const toggle = toggleTask.for(task.id)}
			<td>
				<a
					class="link font-medium link-hover"
					href={resolve('/(app)/crud/[id]', { id: task.id }) + page.url.search}
				>
					{task.description}
				</a>
			</td>
			<td>
				<form {...toggle}>
					<input {...toggle.fields.id.as('hidden', task.id)} />
					<Button
						size="xs"
						color={task.done ? 'success' : 'neutral'}
						variant={task.done ? 'soft' : 'outline'}
						loading={!!toggle.pending}
					>
						{task.done ? 'Done' : 'Open'}
					</Button>

					<!-- Home for `invalid(...)` raised by `toggleTask`, e.g. when the row
					     was deleted in another tab in the meantime. -->
					{#each rootIssues(toggle.fields.allIssues()) as issue, index (index)}
						<p class="text-xs text-error">{issue.message}</p>
					{/each}
				</form>
			</td>
			<td class="text-muted whitespace-nowrap">
				{formatDateTime(task.createdAt, workspace.user.timezone)}
			</td>
			<td class="text-muted whitespace-nowrap">
				{formatDateTime(task.updatedAt, workspace.user.timezone)}
			</td>
		{/snippet}

		{#snippet empty()}
			<div class="p-4 sm:p-6">
				<EmptyState
					class="border-0"
					icon={filtered ? 'FilterRemoveIcon' : 'Task01Icon'}
					title={filtered ? 'Nothing matches these filters' : 'No tasks yet'}
					description={filtered
						? 'Try a different search term, or clear the filters to see everything.'
						: 'Tasks you create show up here, newest first.'}
				>
					{#snippet action()}
						{#if filtered}
							<Button href="/crud" color="neutral" variant="outline" icon="FilterRemoveIcon">
								Reset filters
							</Button>
						{:else}
							<Button href="/crud/new" color="primary" icon="PlusSignIcon">New task</Button>
						{/if}
					{/snippet}
				</EmptyState>
			</div>
		{/snippet}
	</DataTable>

	{#if tasks.items.length}
		<div class="border-t border-base-300">
			<LoadMore
				shown={tasks.items.length}
				total={tasks.total}
				href={tasks.hasMore ? taskList.moreHref(page.url, tasks.limit) : undefined}
			/>
		</div>
	{/if}
</Card>
