import type { ReadonlyURL } from '@sveltejs/kit';
import { z } from 'zod';

/**
 * Reusable foundation for URL-driven lists (search, filters, sorting, "load more").
 *
 * The entire state of a list lives in the query string. That buys three things:
 * the page works without JavaScript, every state is shareable as a link, and the
 * browser's back button does what people expect.
 *
 * To add a list for another model, drop a file next to `task.ts` that describes
 * nothing but its sort fields and filters.
 */

export type SortDir = 'asc' | 'desc';

/** Non-empty list of allowed values. The first one is the default. */
export type Options = readonly [string, ...string[]];

export type ListConfig = {
	/** Sortable fields (must be columns of the model). First one is the default. */
	sort: Options;
	/** Default sort direction. */
	dir?: SortDir;
	/** Extra filters: query parameter -> allowed values (first one is the default). */
	filters?: Record<string, Options>;
	/** How many rows to show initially and to add per "load more" step. */
	pageSize?: number;
	/** Upper bound so `?limit=999999` cannot take the server down. */
	maxLimit?: number;
};

/** The validated parameters read from the URL. */
export type ListParams<C extends ListConfig> = {
	/** Free-text search; an empty string means "no filter". */
	q: string;
	sort: C['sort'][number];
	dir: SortDir;
	limit: number;
} & (C['filters'] extends Record<string, Options>
	? { [K in keyof C['filters']]: C['filters'][K][number] }
	: object);

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_MAX_LIMIT = 500;

/**
 * Takes the query parameters of `url` and applies `patch` to them.
 * A value of `null` or `''` removes the parameter.
 *
 * Typed as `ReadonlyURL` so `page.url` from `$app/state` fits directly; a plain
 * `URL` is assignable too.
 */
export function withParams(
	url: ReadonlyURL,
	patch: Record<string, string | number | null>
): string {
	const params = new URLSearchParams(url.search);

	for (const [key, value] of Object.entries(patch)) {
		if (value === null || value === '') params.delete(key);
		else params.set(key, String(value));
	}

	const query = params.toString();
	return query ? `?${query}` : url.pathname;
}

export function createList<const C extends ListConfig>(config: C) {
	const pageSize = config.pageSize ?? DEFAULT_PAGE_SIZE;
	const defaultDir = config.dir ?? 'desc';
	const filters = config.filters ?? {};

	const shape: Record<string, z.ZodType> = {
		// `.catch(...)` rather than `.default(...)`: missing *and* nonsensical values
		// fall back to the default instead of producing a 400. A mangled URL should
		// render a usable list, not an error page.
		q: z.string().trim().max(200).catch(''),
		sort: z.enum(config.sort).catch(config.sort[0]),
		dir: z.enum(['asc', 'desc']).catch(defaultDir),
		limit: z.coerce
			.number()
			.int()
			.min(1)
			.max(config.maxLimit ?? DEFAULT_MAX_LIMIT)
			.catch(pageSize)
	};

	for (const [name, options] of Object.entries(filters)) {
		shape[name] = z.enum(options).catch(options[0]);
	}

	// The cast reunites the dynamically built shape with the static `ListParams<C>`
	// type. `shape` is derived from exactly this config right above.
	const schema = z.object(shape) as unknown as z.ZodType<ListParams<C>, ListParams<C>>;

	return {
		config,
		pageSize,
		/** Standard Schema used to validate the remote query's argument. */
		schema,

		/** Translate the URL's query parameters into validated list parameters. */
		parse(url: ReadonlyURL): ListParams<C> {
			return schema.parse(Object.fromEntries(url.searchParams));
		},

		/**
		 * Link for a column header. Same column -> flip the direction, other column
		 * -> default direction. `limit` is dropped, otherwise every previously
		 * loaded row would stay around after re-sorting.
		 */
		sortHref(url: ReadonlyURL, field: C['sort'][number]): string {
			const current = this.parse(url);
			const dir: SortDir =
				current.sort === field ? (current.dir === 'asc' ? 'desc' : 'asc') : defaultDir;

			return withParams(url, { sort: field, dir, limit: null });
		},

		/** Link that additionally loads the next page. */
		moreHref(url: ReadonlyURL, limit: number): string {
			return withParams(url, { limit: limit + pageSize });
		}
	};
}
