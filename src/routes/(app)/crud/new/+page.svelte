<script lang="ts">
	import PageTitle from '$components/layout/PageTitle.svelte';
	import { page } from '$app/state';
	import Button from '$components/elements/Button.svelte';
	import Card from '$components/elements/Card.svelte';
	import Field from '$components/elements/Field.svelte';
	import PageHeader from '$components/layout/PageHeader.svelte';
	import { backHref } from '$helper/form';
	import { taskList } from '$helper/task';
	import { getWorkspace } from '$remotes/organization.remote';
	import { createTask, getTasks } from '$remotes/task.remote';

	const workspace = $derived(await getWorkspace());

	// The list link forwarded its query string to this page — build the way back
	// from it so filters, sorting and "load more" state survive the round trip.
	const back = $derived(backHref(page.url, '/crud'));

	// The exact list instance the redirect returns to. Requesting its refresh as
	// part of the submission (single-flight, see `refreshRequestedLists` in the
	// remote) is what makes the new row show up without a hard reload.
	const listToRefresh = () =>
		getTasks({
			organizationId: workspace.organization.id,
			params: taskList.parse(new URL(back, page.url.href))
		});
</script>

<PageTitle text="New task" />

<Button href={back} color="ghost" size="sm" arrowLeft class="mb-4">Back to tasks</Button>

<PageHeader title="New task" description="One line on what needs to happen." />

<!-- `{...createTask.enhance(...)}` supplies `method`/`action` (which works without
     JavaScript) plus an attachment that progressively enhances the submission. -->
<form
	{...createTask.enhance(async (create) => {
		await create.submit().updates(listToRefresh());
	})}
>
	<input {...createTask.fields.returnTo.as('hidden', back)} />

	<Card class="max-w-xl">
		<Field
			label="Description"
			input={createTask.fields.description.as('text')}
			issues={createTask.fields.description.issues()}
			placeholder="What needs to be done?"
			hint="Has to be unique."
		/>

		{#snippet footer()}
			<Button href={back} color="ghost">Cancel</Button>
			<Button color="primary">Create</Button>
		{/snippet}
	</Card>
</form>
