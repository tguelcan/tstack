import { readFileSync } from 'node:fs';
import { getAuthTables } from 'better-auth/db';
import { describe, expect, it } from 'vitest';
import { auth } from './auth';

/**
 * Keeps `prisma/schema.prisma` in step with what Better Auth expects.
 *
 * The models it owns are written by hand — `@better-auth/cli generate` trails
 * the library by two minor versions and cannot resolve this project's aliases.
 * This test is what makes that safe: it asks Better Auth itself, through the
 * same options the app runs with, which tables and columns it is going to read
 * and write, and checks that each one exists. A `better-auth` upgrade that adds
 * a column fails here instead of at runtime.
 *
 * It only proves that nothing is missing. Extra models and columns of our own
 * (`Task`, `NotificationSettings`) are none of its business.
 */

/** Field names per model, straight out of the schema file. */
function parseModels(schema: string): Map<string, Set<string>> {
	const models = new Map<string, Set<string>>();

	// Model bodies contain no braces of their own, so this is unambiguous.
	for (const [, name, body] of schema.matchAll(/model\s+(\w+)\s*\{([^}]*)\}/g)) {
		const fields = body
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('//') && !line.startsWith('@@'))
			.map((line) => line.split(/\s+/)[0]);

		models.set(name, new Set(fields));
	}

	return models;
}

const models = parseModels(readFileSync('prisma/schema.prisma', 'utf8'));
const tables = getAuthTables(auth.options);

describe('the Prisma schema covers what Better Auth writes', () => {
	// Better Auth names its models in lowercase; Prisma models are capitalised.
	const modelName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

	for (const [key, table] of Object.entries(tables)) {
		const name = modelName(table.modelName);

		it(`has model ${name}`, () => {
			expect(models.has(name), `\`model ${name}\` is missing (Better Auth calls it "${key}")`).toBe(
				true
			);
		});

		for (const [field, definition] of Object.entries(table.fields)) {
			// A field can be stored under a different column name; that mapping is
			// what the adapter actually uses.
			const column = definition.fieldName ?? field;

			it(`has ${name}.${column}`, () => {
				expect(models.get(name)?.has(column), `\`${name}.${column}\` is missing`).toBe(true);
			});
		}
	}

	it('gives every model an id', () => {
		for (const table of Object.values(tables)) {
			expect(models.get(modelName(table.modelName))?.has('id')).toBe(true);
		}
	});
});
