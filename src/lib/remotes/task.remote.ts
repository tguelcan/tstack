import { invalid, redirect } from '@sveltejs/kit';
import { form, query, requested } from '$app/server';
import { z } from 'zod';
import type { Prisma } from '$generated/prisma/client';
import { internalPath } from '$helper/form';
import { taskList, type TaskListParams } from '$helper/task';
import { prisma } from '$server/db';
import { requireOrg } from '$server/guard';
import { listResult, toOrderBy } from '$server/list';

/**
 * Every function below runs inside one organization. That is not a filter
 * someone can forget to add: `requireOrg()` is the first line of each one, and
 * its `organizationId` goes into every `where`. A task id on its own never
 * identifies a row — which is what keeps one workspace out of another's data.
 */

const idSchema = z.uuid('Invalid task id');

const descriptionSchema = z
	.string()
	.trim()
	.min(1, 'Please enter a description')
	.max(500, 'Use 500 characters or fewer');

/**
 * List URL to return to after a mutation, so filters, sorting and "load more"
 * state survive the round trip to a detail page. Comes from the client, so it
 * is passed through `internalPath` before redirecting.
 */
const returnToSchema = z.string().max(500).optional();

const GONE = 'This task no longer exists.';

/**
 * Refreshes the list instance the client asked for (see the `enhance` callbacks
 * on the task pages), so the redirect back to the list carries fresh rows in
 * the same round trip. Without this the list would answer out of its cache —
 * the mutation happened on a page where the list query was not active, so the
 * automatic invalidation could not reach it.
 *
 * The limit of 1 matches what the pages request: exactly the list they return
 * to. Without JavaScript nothing is requested and the full reload is fresh anyway.
 */
const refreshRequestedLists = () => requested(getTasks, 1).refreshAll();

function toWhere(organizationId: string, { q, status }: TaskListParams): Prisma.TaskWhereInput {
	const where: Prisma.TaskWhereInput = { organizationId };

	// `mode: 'insensitive'` is Postgres-specific.
	if (q) where.description = { contains: q, mode: 'insensitive' };
	if (status !== 'all') where.done = status === 'done';

	return where;
}

/** Whether another task in this organization already uses this exact description. */
async function isDuplicate(organizationId: string, description: string, exceptId?: string) {
	const match = await prisma.task.findFirst({
		where: {
			organizationId,
			description: { equals: description, mode: 'insensitive' },
			...(exceptId ? { NOT: { id: exceptId } } : {})
		},
		select: { id: true }
	});

	return match !== null;
}

/**
 * Reads one page of tasks. The parameters come from the URL and are validated by
 * `taskList.schema`.
 *
 * `organizationId` rides along in the argument even though the server does not
 * trust it: a remote query is cached by `(function, arguments)`, and without it
 * the list would answer out of the previous organization's cache after a switch.
 * The `where` is built from the session's active organization, so a stale — or
 * invented — id changes the cache key and nothing else.
 */
export const getTasks = query(
	z.object({ organizationId: z.string().min(1), params: taskList.schema }),
	async ({ params }) => {
		const { organizationId } = await requireOrg();
		const where = toWhere(organizationId, params);

		return listResult(
			prisma.task.findMany({
				where,
				orderBy: toOrderBy<Prisma.TaskOrderByWithRelationInput>(params.sort, params.dir),
				take: params.limit
			}),
			prisma.task.count({ where }),
			params.limit
		);
	}
);

/**
 * Returns `null` instead of throwing a 404 when the task is gone — or was never
 * ours. Both have to look the same from outside, otherwise the status code would
 * confirm that a given id exists in someone else's organization.
 *
 * There is a second reason for `null`: after a successful form submission
 * SvelteKit refreshes every active query, and on `deleteTask` that includes this
 * one, for a row that no longer exists. A 404 would win the race against the
 * redirect and leave the user on an error page instead of on the list.
 */
export const getTask = query(idSchema, async (id) => {
	const { organizationId } = await requireOrg();

	return prisma.task.findFirst({ where: { id, organizationId } });
});

export const createTask = form(
	z.object({ description: descriptionSchema, returnTo: returnToSchema }),
	async ({ description, returnTo }, issue) => {
		const { organizationId, user } = await requireOrg();

		// Uniqueness cannot be expressed in the schema — it needs the database.
		// `invalid` attaches the message to the field, so it renders right below
		// the input and survives a submit without JavaScript.
		if (await isDuplicate(organizationId, description)) {
			invalid(issue.description('A task with this description already exists'));
		}

		const task = await prisma.task.create({
			data: { description, organizationId, createdById: user.id }
		});

		await refreshRequestedLists();

		// The anchor scrolls the list to the new row (rows carry `id="task-…"`).
		// If the current filter hides it, the browser simply stays at the top.
		redirect(303, `${internalPath(returnTo, '/crud')}#task-${task.id}`);
	}
);

export const updateTask = form(
	z.object({
		id: idSchema,
		description: descriptionSchema,
		// Checkboxes send nothing when unchecked, so the field has to be optional
		// and default to `false`.
		done: z.boolean().default(false),
		returnTo: returnToSchema
	}),
	async ({ id, description, done, returnTo }, issue) => {
		const { organizationId } = await requireOrg();

		const current = await prisma.task.findFirst({
			where: { id, organizationId },
			select: { description: true }
		});
		if (!current) invalid(GONE);

		// Only guard when the text actually changes. Checking unconditionally would
		// mean that a row already sharing its description with another one could
		// never be saved again — not even just to tick it off.
		const renamed = current.description.toLowerCase() !== description.toLowerCase();
		if (renamed && (await isDuplicate(organizationId, description, id))) {
			invalid(issue.description('A task with this description already exists'));
		}

		// `organizationId` in the `where` is the authorization check as much as the
		// lookup: a foreign task matches nothing, and `count === 0` already has a
		// message for that case.
		const { count } = await prisma.task.updateMany({
			where: { id, organizationId },
			data: { description, done }
		});
		if (count === 0) invalid(GONE);

		await refreshRequestedLists();

		// Back to the list the user came from, anchored to the edited row.
		redirect(303, `${internalPath(returnTo, '/crud')}#task-${id}`);
	}
);

export const deleteTask = form(
	z.object({ id: idSchema, returnTo: returnToSchema }),
	async ({ id, returnTo }) => {
		const { organizationId } = await requireOrg();

		// `deleteMany` returns a count instead of throwing when the row is gone,
		// which turns both a lost race and a foreign id into a message rather than
		// a 500.
		const { count } = await prisma.task.deleteMany({ where: { id, organizationId } });
		if (count === 0) invalid(GONE);

		await refreshRequestedLists();

		// No anchor — the row does not exist anymore.
		redirect(303, internalPath(returnTo, '/crud'));
	}
);

/**
 * Ticks a task off straight from the list. No `redirect`: after a successful
 * `form` submission SvelteKit refreshes the running queries anyway, so the list
 * updates on its own.
 *
 * The new value is derived from the old one on the server rather than taken from
 * the client, so a double submit cannot write back a stale state.
 */
export const toggleTask = form(z.object({ id: idSchema }), async ({ id }) => {
	const { organizationId } = await requireOrg();

	const task = await prisma.task.findFirst({
		where: { id, organizationId },
		select: { done: true }
	});
	if (!task) invalid(GONE);

	const { count } = await prisma.task.updateMany({
		where: { id, organizationId },
		data: { done: !task.done }
	});
	if (count === 0) invalid(GONE);
});
