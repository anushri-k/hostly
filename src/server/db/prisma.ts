import { PrismaClient } from '@prisma/client'

/**
 * Prisma client singleton — reused across HMR reloads in dev so we don't
 * exhaust connections. Server-only; never import this from a client component.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
