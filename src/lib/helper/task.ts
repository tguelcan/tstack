import { createList } from './list';

/**
 * List definition for the Task model. It is needed in two places: on the server
 * to validate the query parameters, and in the browser to build the sort and
 * filter links. That is why it lives here and not under `$server`.
 *
 * The values in `sort` must be columns of the Prisma model — they go straight
 * into `orderBy`.
 */
export const taskList = createList({
	sort: ['createdAt', 'updatedAt', 'description', 'done'],
	dir: 'desc',
	filters: { status: ['all', 'open', 'done'] },
	pageSize: 20
});

export type TaskListParams = ReturnType<typeof taskList.parse>;
export type TaskSort = TaskListParams['sort'];
export type TaskStatus = TaskListParams['status'];

/** Table columns — order and caption of the sortable headers. */
export const taskColumns: { field: TaskSort; label: string }[] = [
	{ field: 'description', label: 'Description' },
	{ field: 'done', label: 'Status' },
	{ field: 'createdAt', label: 'Created' },
	{ field: 'updatedAt', label: 'Updated' }
];

/**
 * Captions for the status filter. The first entry is the default and doubles as
 * the reset option of the daisyUI filter component.
 */
export const taskStatusLabels: Record<TaskStatus, string> = {
	all: 'All',
	open: 'Open',
	done: 'Done'
};
