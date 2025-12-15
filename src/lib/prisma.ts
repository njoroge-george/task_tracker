import { PrismaClient } from '@prisma/client';

/*
    ✅ This ensures only one Prisma client instance is used — very important for Next.js (especially with hot reload).
    Note: Workspace filtering should be done at the application level in API routes
*/
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
