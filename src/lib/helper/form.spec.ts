import { describe, expect, it } from 'vitest';
import { backHref, internalPath, rootIssues } from './form';

describe('rootIssues', () => {
	it('keeps issues without a path — they belong to the form as a whole', () => {
		const issues = [{ message: 'gone' }, { message: 'also gone', path: [] }];

		expect(rootIssues(issues)).toEqual(issues);
	});

	it('drops field issues — those already render next to their input', () => {
		const issues = [{ message: 'gone' }, { message: 'field', path: ['description'] }];

		expect(rootIssues(issues)).toEqual([{ message: 'gone' }]);
	});

	it('treats undefined as no issues', () => {
		expect(rootIssues(undefined)).toEqual([]);
	});
});

describe('internalPath', () => {
	it('passes same-origin absolute paths through', () => {
		expect(internalPath('/crud?status=open&limit=40', '/crud')).toBe('/crud?status=open&limit=40');
	});

	// The second tuple element only labels the test name (`%s`).
	it.each([
		['https://evil.example', 'absolute URL'],
		['//evil.example', 'protocol-relative'],
		['/\\evil.example', 'backslash — browsers treat \\ as /'],
		['javascript:alert(1)', 'scheme'],
		['crud', 'relative path'],
		['', 'empty'],
		[undefined, 'missing']
	] as [string | undefined, string][])('falls back for %s (%s)', (value) => {
		expect(internalPath(value, '/crud')).toBe('/crud');
	});
});

describe('backHref', () => {
	const url = (search: string) => new URL(`http://test/crud/some-id${search}`);

	it('carries the forwarded list state', () => {
		expect(backHref(url('?status=open&limit=40'), '/crud')).toBe('/crud?status=open&limit=40');
	});

	it('returns the bare base for an empty query', () => {
		expect(backHref(url(''), '/crud')).toBe('/crud');
	});

	it('strips the /remote marker a no-JS form POST leaves behind', () => {
		expect(backHref(url('?/remote=abc123/updateTask'), '/crud')).toBe('/crud');
	});
});
