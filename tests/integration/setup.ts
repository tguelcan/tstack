import { execSync, spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { TestProject } from 'vitest/node';

/**
 * Boots the app for the integration tests: applies migrations, seeds the demo
 * accounts (a no-op when users already exist) and starts the production build
 * on a free port. The tests receive the base URL via `inject('baseUrl')`.
 */

declare module 'vitest' {
	export interface ProvidedContext {
		baseUrl: string;
	}
}

let server: ChildProcess | undefined;

export default async function setup(project: TestProject) {
	if (!process.env.DATABASE_URL) {
		throw new Error(
			'DATABASE_URL is not set. Integration tests need a real Postgres — see .env.example.'
		);
	}

	if (!existsSync('build/index.js')) {
		throw new Error('build/index.js is missing — run `bun run build` first.');
	}

	try {
		execSync('bunx prisma migrate deploy', { stdio: 'inherit' });
	} catch {
		// P3005 on a database that was set up with `db push` or already carries
		// dev-server bookkeeping schemas. The tests fail loudly if the schema is
		// actually missing, so a warning is enough here.
		console.warn('[integration] `prisma migrate deploy` failed — assuming the schema exists.');
	}

	execSync('bunx prisma db seed', { stdio: 'inherit' });

	const port = 4100 + Math.floor(Math.random() * 500);
	const baseUrl = `http://localhost:${port}`;

	// The production server refuses to start without these; give it a complete,
	// self-consistent environment rather than inheriting half of a dev `.env`.
	server = spawn(process.execPath, ['build/index.js'], {
		stdio: ['ignore', 'inherit', 'inherit'],
		env: {
			...process.env,
			PORT: String(port),
			ORIGIN: baseUrl,
			BETTER_AUTH_URL: baseUrl,
			BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || 'integration-tests-only-secret',
			RESEND_API_KEY: '',
			UPLOAD_DIR: mkdtempSync(join(tmpdir(), 'tstack-uploads-'))
		}
	});

	const deadline = Date.now() + 60_000;
	for (;;) {
		try {
			const response = await fetch(`${baseUrl}/login`);
			if (response.ok) break;
		} catch {
			// still booting
		}

		if (Date.now() > deadline) {
			server.kill();
			throw new Error(`Server did not become ready on ${baseUrl} within 60s.`);
		}

		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	project.provide('baseUrl', baseUrl);

	return () => {
		server?.kill();
	};
}
