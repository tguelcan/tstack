import type { SortDir } from '$helper/list';

/**
 * Server-side counterpart to `$helper/list`: turns validated list parameters
 * into Prisma arguments and brings the result into one consistent shape.
 */

export type ListResult<T> = {
	items: T[];
	/** Total number of matches — powers "20 of 137". */
	total: number;
	/** The limit currently requested; basis for the "load more" link. */
	limit: number;
	hasMore: boolean;
};

/**
 * Builds a Prisma `orderBy` with a stable tiebreaker on `id`.
 *
 * Without the tiebreaker the order of rows sharing a sort value (e.g. many tasks
 * with `done = false`) is undefined — rows could show up twice or vanish while
 * paging. Because the ids are UUIDv7, ordering by id also matches creation order.
 *
 * The cast is safe because `sort` is constrained to existing columns by a Zod
 * enum; the caller supplies the concrete Prisma type.
 */
export function toOrderBy<T>(sort: string, dir: SortDir, tiebreak = 'id'): T[] {
	const order: Record<string, SortDir>[] = [{ [sort]: dir }];
	if (sort !== tiebreak) order.push({ [tiebreak]: dir });

	return order as T[];
}

/**
 * Runs the data and count queries in parallel and derives `hasMore` from them.
 *
 * Deliberately using `count` instead of `take: limit + 1`: the total is shown in
 * the UI anyway, and both queries run at the same time.
 */
export async function listResult<T>(
	items: Promise<T[]>,
	total: Promise<number>,
	limit: number
): Promise<ListResult<T>> {
	const [rows, count] = await Promise.all([items, total]);

	return { items: rows, total: count, limit, hasMore: count > rows.length };
}
