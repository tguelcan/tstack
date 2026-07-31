import { auth } from '$server/auth';
import type { RequestHandler } from './$types';

/**
 * Better Auth's own endpoints — sign-in callbacks, verification links, the
 * session endpoint the OAuth redirect comes back to.
 *
 * Mounted as a route rather than routed inside `handle` via `svelteKitHandler`,
 * for two reasons: the path shows up in the route tree, so `hooks.server.ts` can
 * exempt it by `route.id` instead of by string-matching the URL, and `handle`
 * stays a guard with nothing else in it.
 */

const handler: RequestHandler = ({ request }) => auth.handler(request);

export const GET = handler;
export const POST = handler;
