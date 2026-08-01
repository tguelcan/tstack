import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';
import { PrismaClient } from '../src/generated/prisma/client.ts';

/**
 * Demo data: three users, two organizations, a task list to play with.
 *
 * The passwords go through Better Auth's own `hashPassword`, so the seeded
 * accounts can actually sign in — a hash written any other way would be
 * rejected at the login form. `emailVerified` is set, because the app requires
 * a confirmed address before the first sign-in and no mail is sent from here.
 *
 * This script runs outside Vite (see `prisma.config.ts`), so it cannot import
 * `$server/auth` — everything it needs is written through Prisma directly.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PASSWORD = 'demo-password';

const id = () => crypto.randomUUID();

const descriptions = [
	'Review invoices for the quarter',
	'Update the onboarding docs',
	'Walk through the backup strategy with the team',
	'Go over the feedback from support',
	'Audit dependencies for security advisories',
	'Unify the design tokens',
	'Measure landing page load times',
	'Translate the error messages',
	'Raise test coverage for the payment logic',
	'Refresh the emergency contacts in the wiki',
	'Clean up the monitoring alerts',
	'Check accessibility of the forms'
];

/** A user who can sign in: the row plus the credential account holding the hash. */
async function createUser(name: string, email: string) {
	const user = await prisma.user.create({
		data: { id: id(), name, email, emailVerified: true, timezone: 'Europe/Berlin' }
	});

	await prisma.account.create({
		data: {
			id: id(),
			userId: user.id,
			// For credential accounts Better Auth stores the user's own id here.
			accountId: user.id,
			providerId: 'credential',
			password: await hashPassword(PASSWORD)
		}
	});

	return user;
}

async function createOrganization(name: string, slug: string, ownerId: string) {
	const organization = await prisma.organization.create({ data: { id: id(), name, slug } });

	await prisma.member.create({
		data: { id: id(), organizationId: organization.id, userId: ownerId, role: 'owner' }
	});

	return organization;
}

// The user table is the sentinel, not the task table — tasks belong to an
// organization now, so an empty task list says nothing about whether this ran.
const existing = await prisma.user.count();

if (existing > 0) {
	console.log(`Skipped — there are already ${existing} users.`);
} else {
	const owner = await createUser('Alex Rivera', 'owner@example.com');
	const member = await createUser('Mara Lindqvist', 'mara@example.com');
	const outsider = await createUser('Jonas Weber', 'jonas@example.com');

	const acme = await createOrganization('Acme Inc.', 'acme', owner.id);
	await prisma.member.create({
		data: { id: id(), organizationId: acme.id, userId: member.id, role: 'admin' }
	});

	// A second organization with no overlap in members. Without one, nothing in
	// the app ever proves that the tenant scoping in `task.remote.ts` holds.
	const globex = await createOrganization('Globex', 'globex', outsider.id);

	const hour = 60 * 60 * 1000;
	const now = Date.now();

	// Staggered over time so sorting and "load more" have something to chew on.
	// Descriptions are unique because `createTask` rejects duplicates.
	const tasks = Array.from({ length: 47 }, (_, index) => {
		const createdAt = new Date(now - index * 7 * hour);

		return {
			description: `${descriptions[index % descriptions.length]} (#${index + 1})`,
			done: index % 3 === 0,
			organizationId: acme.id,
			createdById: index % 2 === 0 ? owner.id : member.id,
			createdAt,
			updatedAt: createdAt
		};
	});

	await prisma.task.createMany({ data: tasks });

	await prisma.task.create({
		data: {
			description: 'Globex-only task — must never show up in Acme',
			organizationId: globex.id,
			createdById: outsider.id
		}
	});

	console.log(`Created 3 users, 2 organizations and ${tasks.length + 1} tasks.`);
	console.log(`Sign in as owner@example.com / ${PASSWORD}`);
}

await prisma.$disconnect();
