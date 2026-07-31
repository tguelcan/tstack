import type { Session, SessionUser } from '$server/auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			/**
			 * Filled by `hooks.server.ts` on every page request, so a layout or an
			 * endpoint does not have to ask Better Auth again.
			 *
			 * Reading this is not an authorization check — remote functions never
			 * reach the hook (see the comment there) and go through `$server/guard`.
			 */
			user: SessionUser | null;
			session: Session['session'] | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
