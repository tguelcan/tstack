import { query } from '$app/server';
import { config } from '$server/config';

/** Name and version for the client. The rest of the config stays on the server. */
export const getConfig = query(async () => config.app);
