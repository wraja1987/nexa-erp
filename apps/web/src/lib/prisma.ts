import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  // During build time, DATABASE_URL may not be available
  // Skip validation during build - Prisma will validate at first use
  const clientOptions: any = {
    log: process.env.NODE_ENV === "production" ? ["warn", "error"] : ["query", "info", "warn", "error"],
  };

  // Only validate DATABASE_URL if we're not in build mode
  if (process.env.DATABASE_URL || process.env.NEXT_PHASE === "phase-production-build") {
    return new PrismaClient(clientOptions);
  }

  // During build without DATABASE_URL, create client but it will fail at first use
  // This is acceptable as API routes should not execute during build
  return new PrismaClient(clientOptions);
}

export const prisma =
  global.prisma ||
  createPrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
