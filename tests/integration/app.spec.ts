import { describe, expect, inject, it } from 'vitest';

/**
 * End-to-end HTTP tests against the production build and a real Postgres.
 * They cover the paths a template user relies on before writing any code:
 * the public pages render, the auth wall holds, the seeded account can sign
 * in, and a fresh sign-up is forced through email verification.
 */

const base = () => inject('baseUrl');

/** Collects the cookies a response sets, formatted for a `Cookie` header. */
function cookiesOf(response: Response): string {
	return response.headers
		.getSetCookie()
		.map((cookie) => cookie.split(';')[0])
		.join('; ');
}

async function signIn(email: string, password: string): Promise<Response> {
	return fetch(`${base()}/api/auth/sign-in/email`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', origin: base() },
		body: JSON.stringify({ email, password })
	});
}

describe('public pages', () => {
	it('serves the landing page', async () => {
		const response = await fetch(base());

		expect(response.status).toBe(200);
		expect(await response.text()).toContain('<html');
	});

	it.each(['/login', '/register', '/components', '/privacy'])('serves %s', async (path) => {
		const response = await fetch(base() + path);

		expect(response.status).toBe(200);
	});
});

describe('auth wall', () => {
	it('redirects a signed-out visitor from the app to the login form', async () => {
		const response = await fetch(`${base()}/dashboard`, { redirect: 'manual' });

		expect(response.status).toBe(303);
		expect(response.headers.get('location')).toContain('/login');
	});

	it('carries the requested page into the redirect', async () => {
		const response = await fetch(`${base()}/crud?q=invoices`, { redirect: 'manual' });

		expect(response.headers.get('location')).toContain(encodeURIComponent('/crud?q=invoices'));
	});

	it('rejects a sign-in with a wrong password', async () => {
		const response = await signIn('owner@example.com', 'not-the-password');

		expect(response.status).toBe(401);
	});

	it('requires a session for uploaded files', async () => {
		const response = await fetch(`${base()}/uploads/avatar/whatever.webp`, {
			redirect: 'manual'
		});

		expect(response.status).toBeGreaterThanOrEqual(400);
	});
});

describe('seeded account', () => {
	it('signs in and reaches the dashboard', async () => {
		const signedIn = await signIn('owner@example.com', 'demo-password');
		expect(signedIn.status).toBe(200);

		const cookie = cookiesOf(signedIn);
		expect(cookie).toContain('session_token');

		const dashboard = await fetch(`${base()}/dashboard`, { headers: { cookie } });
		expect(dashboard.status).toBe(200);
		expect(await dashboard.text()).toContain('Dashboard');
	});

	it('keeps a signed-in user away from the auth pages', async () => {
		const signedIn = await signIn('owner@example.com', 'demo-password');
		const cookie = cookiesOf(signedIn);

		const login = await fetch(`${base()}/login`, {
			headers: { cookie },
			redirect: 'manual'
		});

		expect(login.status).toBe(303);
		expect(login.headers.get('location')).toContain('/dashboard');
	});
});

describe('sign-up', () => {
	const email = `integration-${Date.now()}@example.com`;

	it('creates the account', async () => {
		const response = await fetch(`${base()}/api/auth/sign-up/email`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', origin: base() },
			body: JSON.stringify({ name: 'Integration Test', email, password: 'integration-password' })
		});

		expect(response.status).toBe(200);
	});

	it('blocks the sign-in until the address is verified', async () => {
		const response = await signIn(email, 'integration-password');

		expect(response.status).toBe(403);
	});
});
