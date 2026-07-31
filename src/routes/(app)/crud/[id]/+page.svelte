<script lang="ts">
	import { page } from '$app/state';
	import type { RouteParams } from '$app/types';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import EmptyState from '$components/elements/EmptyState.svelte';
	import Field from '$components/elements/Field.svelte';
	import Modal from '$components/elements/Modal.svelte';
	import PageHeader from '$components/layout/PageHeader.svelte';
	import { formatDateTime } from '$helper/format';
	import { backHref, rootIssues } from '$helper/form';
	import { taskList } from '$helper/task';
	import { getWorkspace } from '$remotes/organization.remote';
	import { deleteTask, getTask, getTasks, updateTask } from '$remotes/task.remote';

	// `page.params` is typed across all routes, so `id` would be optional here.
	// The cast pins it to this route — the `(app)` group is part of the route id.
	const params = $derived(page.params as RouteParams<'/(app)/crud/[id]'>);
	const task = $derived(await getTask(params.id));
	const workspace = $derived(await getWorkspace());

	// The list link forwarded its query string to this page — build the way back
	// from it so filters, sorting and "load more" state survive the round trip.
	const back = $derived(backHref(page.url, '/crud'));

	// The exact list instance the redirect returns to. Requesting its refresh as
	// part of the submission (single-flight, see `refreshRequestedLists` in the
	// remote) is what makes the change show up without a hard reload.
	const listToRefresh = () =>
		getTasks({
			organizationId: workspace.organization.id,
			params: taskList.parse(new URL(back, page.url.href))
		});
</script>

<svelte:head><title>{task?.description ?? 'Task not found'} · tstack</title></svelte:head>

<Button href={back} color="ghost" size="sm" arrowLeft class="mb-4">Back to tasks</Button>

{#if task}
	<!-- One form instance per task. Without `for(...)` these are module-wide
	     singletons: their field state survives a client-side navigation, so
	     opening another task would show the previously edited values while the
	     hidden id already points at the new row — saving would overwrite it. -->
	{@const update = updateTask.for(task.id)}
	{@const remove = deleteTask.for(task.id)}

	<PageHeader
		title="Edit task"
		description="Created {formatDateTime(
			task.createdAt,
			workspace.user.timezone
		)} · Updated {formatDateTime(task.updatedAt, workspace.user.timezone)}"
	/>

	<div class="grid max-w-xl gap-4">
		<form
			{...update.enhance(async (save) => {
				await save.submit().updates(listToRefresh());
			})}
		>
			<input {...update.fields.id.as('hidden', task.id)} />
			<input {...update.fields.returnTo.as('hidden', back)} />

			<Card>
				<!-- An `input`, not a `textarea`: `as('text', …)` works through the `value`
				     attribute, which HTML ignores on a textarea. Without JavaScript the field
				     would arrive empty, and a validation error would lose what was typed. -->
				<Field
					label="Description"
					input={update.fields.description.as('text', task.description)}
					issues={update.fields.description.issues()}
					hint="Has to be unique."
				/>

				<Field label="Status">
					<label class="flex w-fit cursor-pointer items-center gap-3 py-1">
						<input {...update.fields.done.as('checkbox', task.done)} class="checkbox" />
						<span class="text-sm">Done</span>
					</label>
				</Field>

				{#each rootIssues(update.fields.allIssues()) as issue, index (index)}
					<p class="mt-2 text-sm text-error">{issue.message}</p>
				{/each}

				{#snippet footer()}
					<Button href={back} color="ghost">Cancel</Button>
					<Button color="primary">Save</Button>
				{/snippet}
			</Card>
		</form>

		<form
			{...remove.enhance(async (destroy) => {
				await destroy.submit().updates(listToRefresh());
			})}
			id="delete-task"
		>
			<input {...remove.fields.id.as('hidden', task.id)} />
			<input {...remove.fields.returnTo.as('hidden', back)} />

			<Card title="Danger zone" icon="Alert01Icon" tone="error">
				<p class="text-sm">Deleting this task cannot be undone.</p>

				{#each rootIssues(remove.fields.allIssues()) as issue, index (index)}
					<p class="mt-2 text-sm text-error">{issue.message}</p>
				{/each}

				{#snippet footer()}
					<!-- `type="button"`: this only opens the dialog, the actual submit happens
					     from inside it. -->
					<Button
						type="button"
						command="show-modal"
						commandfor="confirm-delete"
						color="error"
						variant="outline"
						icon="Delete02Icon"
					>
						Delete task
					</Button>
				{/snippet}
			</Card>
		</form>
	</div>

	<!-- Outside the form on purpose: an open dialog is moved to the top layer, so
	     the confirming button reaches its form via `form="delete-task"`. -->
	<Modal id="confirm-delete" title="Delete this task?" description="This cannot be undone.">
		<p class="rounded-box bg-base-200 px-4 py-3 font-medium">{task.description}</p>

		{#snippet actions()}
			<Button form="delete-task" color="error" icon="Delete02Icon">Delete</Button>
		{/snippet}
	</Modal>
{:else}
	<EmptyState
		icon="Task01Icon"
		title="Task not found"
		description="It may have been deleted in the meantime."
	>
		{#snippet action()}
			<Button href={back} color="neutral" variant="outline">Back to tasks</Button>
		{/snippet}
	</EmptyState>
{/if}
