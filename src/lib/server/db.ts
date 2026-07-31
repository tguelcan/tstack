import { dev } from '$app/env';
import { DATABASE_URL } from '$app/env/private';
import { PrismaClient } from '$generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// In dev, Vite re-imports server modules on every change. Without this cache on
// `globalThis` that would create a fresh connection pool each time, until
// Postgres stops accepting connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter: new PrismaPg({ connectionString: DATABASE_URL })
	});

if (dev) globalForPrisma.prisma = prisma;
