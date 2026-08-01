/**
 * Placeholder content for the pages that are still a template.
 *
 * The dashboard's figures and the billing plans are not computed anywhere — they
 * are here so the pages have something to show. Everything else in `(app)` reads
 * real data now; delete an export from this file and follow the type errors to
 * see what is left to wire up.
 */

export const dashboardStats = [
	{ label: 'Active users', value: '2,847', delta: 12, icon: 'UserGroupIcon' },
	{ label: 'Monthly revenue', value: '€18,420', delta: 4, icon: 'Wallet01Icon' },
	{ label: 'Open tasks', value: '37', delta: -8, icon: 'Task01Icon' },
	{ label: 'Uptime', value: '99.98%', delta: 0, icon: 'Analytics01Icon' }
];

export const activity = [
	{
		id: 'a1',
		actor: 'Mara Lindqvist',
		action: 'invited Priya Raman to the workspace',
		at: '18 minutes ago'
	},
	{
		id: 'a2',
		actor: 'Jonas Weber',
		action: 'closed the task "Migrate billing webhooks"',
		at: '2 hours ago'
	},
	{ id: 'a3', actor: 'System', action: 'ran the nightly backup', at: '6 hours ago' },
	{
		id: 'a4',
		actor: 'Alex Rivera',
		action: 'changed the workspace plan to Team',
		at: 'Yesterday'
	}
];

export type Plan = {
	name: string;
	price: string;
	period: string;
	description: string;
	features: string[];
	current?: boolean;
};

export const plans: Plan[] = [
	{
		name: 'Starter',
		price: '€0',
		period: 'per month',
		description: 'For trying things out on a single project.',
		features: ['1 workspace', '3 team members', 'Community support']
	},
	{
		name: 'Team',
		price: '€29',
		period: 'per month',
		description: 'For small teams that ship together.',
		features: ['Unlimited workspaces', '25 team members', 'Priority support', 'Audit log'],
		current: true
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		period: 'billed yearly',
		description: 'For organisations with review processes.',
		features: ['SSO & SCIM', 'Unlimited members', 'Dedicated support', 'Custom contracts']
	}
];

export const invoices = [
	{ id: 'INV-2026-007', date: '1 July 2026', amount: '€29.00', status: 'Paid' },
	{ id: 'INV-2026-006', date: '1 June 2026', amount: '€29.00', status: 'Paid' },
	{ id: 'INV-2026-005', date: '1 May 2026', amount: '€29.00', status: 'Paid' }
];
