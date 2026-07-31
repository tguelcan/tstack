import { defineConfig } from 'prisma/config';

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
		seed: 'bun run prisma/seed.ts'
	},
	datasource: {
		// Deliberately `process.env` instead of the `env()` helper from
		// `prisma/config`: `env()` throws when the variable is missing, and the
		// config is parsed on *every* CLI call — including `prisma generate`,
		// which does not need a database at all.
		url: process.env.DATABASE_URL ?? ''
	}
});
