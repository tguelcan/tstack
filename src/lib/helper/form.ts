/**
 * Helpers around SvelteKit's remote `form` functions.
 */

import type { ReadonlyURL } from '@sveltejs/kit';

type Issue = { readonly message: string; readonly path?: readonly unknown[] };

/**
 * Issues that belong to the form as a whole rather than to a single field.
 *
 * `fields.allIssues()` returns per-field issues too, and those are already
 * rendered next to their input. Filtering by an empty path is what keeps them
 * from appearing twice.
 */
export function rootIssues(issues: readonly Issue[] | undefined): readonly Issue[] {
	return (issues ?? []).filter((issue) => !issue.path?.length);
}

/**
 * Guards a client-supplied redirect target against open redirects.
 *
 * Only same-origin absolute paths pass — anything else falls back:
 * - `https://evil.example` (absolute URL)
 * - `//evil.example` (protocol-relative)
 * - `/\evil.example` (browsers treat `\` as `/`, so this is protocol-relative too)
 */
export function internalPath(value: string | undefined, fallback: string): string {
	return value && /^\/(?![/\\])/.test(value) ? value : fallback;
}

/**
 * Builds the "back to the list" href for a detail page whose link carried the
 * list's query string along.
 *
 * Strips the `/remote` marker that a no-JS form POST leaves in the URL —
 * without that, Cancel after a failed validation would link to
 * `/crud?/remote=…` instead of the list.
 */
export function backHref(url: ReadonlyURL, base: string): string {
	const params = new URLSearchParams(url.search);
	params.delete('/remote');

	const query = params.toString();
	return query ? `${base}?${query}` : base;
}
