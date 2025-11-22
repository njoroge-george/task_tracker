import { PrismaClient } from '@prisma/client';

{/* 
    ✅ This ensures only one Prisma client instance is used — very important for Next.js (especially with hot reload).
    
*/}
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
