import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/**
 * The page used to live here, back when it listed a hard-coded team. An
 * organization has members, so that is what it is called now — and old links,
 * bookmarks and anything that still points at `/team` keep working.
 */
export const load: PageLoad = () => {
	redirect(308, '/members');
};
