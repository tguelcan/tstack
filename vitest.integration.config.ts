import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

/**
 * Integration tests run against the real production build (`build/index.js`)
 * talking to a real Postgres — no mocks, no Vite plugins. The global setup in
 * `tests/integration/setup.ts` migrates the database, seeds the demo data and
 * boots the server; the tests then speak plain HTTP.
 *
 * Run with: bun run build && bun run test:integration
 */

// The tests read DATABASE_URL from the environment; in development it lives in
// `.env`, which nothing on this code path loads for us.
if (existsSync('.env')) {
	try {
		process.loadEnvFile('.env');
	} catch {
		// Runtime without loadEnvFile — the variables have to come from the shell.
	}
}

export default defineConfig({
	test: {
		name: 'integration',
		environment: 'node',
		include: ['tests/integration/**/*.spec.ts'],
		globalSetup: ['tests/integration/setup.ts'],
		expect: { requireAssertions: true },
		testTimeout: 30_000,
		hookTimeout: 120_000,
		// The tests share one server and one database — parallel files would
		// race each other's fixtures for no win at this scale.
		fileParallelism: false
	}
});
