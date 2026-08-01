import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads `.env` itself once a config file exists, and the
// CLI runs under Node even when invoked through bun — so load it here or
// `bun run db:migrate` fails with "Connection url is empty" on a fresh clone.
if (existsSync('.env')) {
	process.loadEnvFile('.env');
}

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
