import { describe, expect, it } from 'vitest';
import { createList, withParams } from './list';

const list = createList({
	sort: ['createdAt', 'description'],
	dir: 'desc',
	filters: { status: ['all', 'open', 'done'] },
	pageSize: 20,
	maxLimit: 500
});

const url = (search = '') => new URL(`http://test/crud${search}`);

describe('parse', () => {
	it('falls back to defaults for a bare URL', () => {
		expect(list.parse(url())).toEqual({
			q: '',
			sort: 'createdAt',
			dir: 'desc',
			limit: 20,
			status: 'all'
		});
	});

	it('accepts valid parameters', () => {
		const params = list.parse(url('?q=alerts&sort=description&dir=asc&limit=40&status=open'));

		expect(params).toEqual({
			q: 'alerts',
			sort: 'description',
			dir: 'asc',
			limit: 40,
			status: 'open'
		});
	});

	it('recovers from garbage instead of throwing — a mangled URL must render a usable list', () => {
		const params = list.parse(url('?sort=DROP+TABLE&dir=sideways&limit=NaN&status=maybe'));

		expect(params.sort).toBe('createdAt');
		expect(params.dir).toBe('desc');
		expect(params.limit).toBe(20);
		expect(params.status).toBe('all');
	});

	it('caps limit so ?limit=999999 cannot take the server down', () => {
		expect(list.parse(url('?limit=999999')).limit).toBe(20);
		expect(list.parse(url('?limit=500')).limit).toBe(500);
	});

	it('trims the search term', () => {
		expect(list.parse(url('?q=%20%20alerts%20')).q).toBe('alerts');
	});
});

describe('sortHref', () => {
	it('flips the direction when the column is already active', () => {
		expect(list.sortHref(url('?sort=createdAt&dir=desc'), 'createdAt')).toBe(
			'?sort=createdAt&dir=asc'
		);
	});

	it('uses the default direction when switching columns', () => {
		expect(list.sortHref(url('?sort=createdAt&dir=asc'), 'description')).toBe(
			'?sort=description&dir=desc'
		);
	});

	it('drops limit so re-sorting does not keep every loaded page', () => {
		expect(list.sortHref(url('?limit=80'), 'description')).not.toContain('limit');
	});

	it('keeps unrelated parameters like filters and search', () => {
		const href = list.sortHref(url('?q=alerts&status=open'), 'description');

		expect(href).toContain('q=alerts');
		expect(href).toContain('status=open');
	});
});

describe('moreHref', () => {
	it('grows the limit by one page', () => {
		expect(list.moreHref(url('?limit=20'), 20)).toBe('?limit=40');
	});

	it('keeps filters and sorting', () => {
		expect(list.moreHref(url('?status=done&sort=description'), 20)).toBe(
			'?status=done&sort=description&limit=40'
		);
	});
});

describe('withParams', () => {
	it('sets and overrides parameters', () => {
		expect(withParams(url('?a=1'), { b: 2 })).toBe('?a=1&b=2');
		expect(withParams(url('?a=1'), { a: 3 })).toBe('?a=3');
	});

	it('removes parameters for null and empty string', () => {
		expect(withParams(url('?a=1&b=2'), { a: null })).toBe('?b=2');
		expect(withParams(url('?a=1&b=2'), { a: '' })).toBe('?b=2');
	});

	it('returns the pathname when nothing is left', () => {
		expect(withParams(url('?a=1'), { a: null })).toBe('/crud');
	});
});
