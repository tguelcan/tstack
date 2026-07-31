import { describe, expect, it } from 'vitest';
import { listResult, toOrderBy } from './list';

describe('toOrderBy', () => {
	it('adds the id tiebreaker in the same direction', () => {
		expect(toOrderBy('createdAt', 'desc')).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
		expect(toOrderBy('description', 'asc')).toEqual([{ description: 'asc' }, { id: 'asc' }]);
	});

	it('does not duplicate the tiebreak column when sorting by it', () => {
		expect(toOrderBy('id', 'asc')).toEqual([{ id: 'asc' }]);
	});
});

describe('listResult', () => {
	const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i }));

	it('reports hasMore while the total exceeds the loaded rows', async () => {
		const result = await listResult(Promise.resolve(rows(20)), Promise.resolve(47), 20);

		expect(result).toEqual({ items: rows(20), total: 47, limit: 20, hasMore: true });
	});

	it('reports hasMore=false once everything is loaded', async () => {
		const result = await listResult(Promise.resolve(rows(47)), Promise.resolve(47), 60);

		expect(result.hasMore).toBe(false);
	});

	it('handles an empty result', async () => {
		const result = await listResult(Promise.resolve([]), Promise.resolve(0), 20);

		expect(result).toEqual({ items: [], total: 0, limit: 20, hasMore: false });
	});
});
