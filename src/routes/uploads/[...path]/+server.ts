import { readFile } from 'node:fs/promises';
import { error } from '@sveltejs/kit';
import { config } from '$server/config';
import { resolveUpload } from '$server/upload';
import type { RequestHandler } from './$types';

/**
 * Serves the images written by `$server/upload`.
 *
 * A normal endpoint rather than static assets, for two reasons: the files live
 * outside the app directory on a mounted volume, and in a workspace app an
 * avatar is not public — `uploads.requireSession` in `config.json` decides that.
 *
 * Names are random and the contents never change, so the response can be cached
 * for a year. `private` when a session is required, because a shared cache must
 * not hand one workspace's images to the next visitor.
 */

const YEAR = 60 * 60 * 24 * 365;

export const GET: RequestHandler = async ({ params, locals }) => {
	const guarded = config.uploads.requireSession;

	// 404 rather than 401: whether a given file exists is itself information.
	if (guarded && !locals.user) error(404, 'Not found');

	const file = resolveUpload(params.path);
	if (!file) error(404, 'Not found');

	const body = await readFile(file).catch(() => null);
	if (!body) error(404, 'Not found');

	return new Response(new Uint8Array(body), {
		headers: {
			// Always WebP — it is the only thing `storeImage` writes, and taking the
			// type from the request path would let the visitor choose it.
			'content-type': 'image/webp',
			'content-length': String(body.byteLength),
			'cache-control': `${guarded ? 'private' : 'public'}, max-age=${YEAR}, immutable`,
			'x-content-type-options': 'nosniff'
		}
	});
};
