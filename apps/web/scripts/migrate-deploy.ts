#!/usr/bin/env tsx
/*
  Migration helper: Try prisma migrate deploy; if no migrations or NextAuth tables missing, fallback to prisma db push.
*/
import { execSync } from 'node:child_process';
import process from 'node:process';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const [{ count }] = await prisma.$queryRawUnsafe<any[]>(
      'SELECT COUNT(*)::int AS count FROM "_prisma_migrations"'
    ).catch(() => [{ count: 0 }]);

    const [presence] = await prisma.$queryRawUnsafe<any[]>(
      'SELECT (
        to_regclass(' + "'public.\"User\"'" + ') IS NOT NULL) AS "User",
        (to_regclass(' + "'public.\"Account\"'" + ') IS NOT NULL) AS "Account",
        (to_regclass(' + "'public.\"Session\"'" + ') IS NOT NULL) AS "Session",
        (to_regclass(' + "'public.\"VerificationToken\"'" + ') IS NOT NULL) AS "VerificationToken"'
      + ')'
    ).catch(() => [{ User: false, Account: false, Session: false, VerificationToken: false }]);

    const missingAuthTables = !(presence?.User && presence?.Account && presence?.Session && presence?.VerificationToken);

    // Try proper migrations first when there are any
    if (count > 0) {
      try {
        console.log('== prisma migrate deploy');
        execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
      } catch (e) {
        console.error('migrate deploy failed:', e instanceof Error ? e.message : String(e));
      }
    }

    // Fallback to db push when no migrations or auth tables missing
    if (count === 0 || missingAuthTables) {
      console.log('== prisma db push (fallback)');
      execSync('pnpm prisma db push', { stdio: 'inherit' });
    }

    // Final sanity: ensure tables exist now
    const [finalPresence] = await prisma.$queryRawUnsafe<any[]>(
      'SELECT (
        to_regclass(' + "'public.\"User\"'" + ') IS NOT NULL) AS "User",
        (to_regclass(' + "'public.\"Account\"'" + ') IS NOT NULL) AS "Account",
        (to_regclass(' + "'public.\"Session\"'" + ') IS NOT NULL) AS "Session",
        (to_regclass(' + "'public.\"VerificationToken\"'" + ') IS NOT NULL) AS "VerificationToken"'
      + ')'
    ).catch(() => [{ User: false, Account: false, Session: false, VerificationToken: false }]);

    if (!(finalPresence?.User && finalPresence?.Account && finalPresence?.Session && finalPresence?.VerificationToken)) {
      console.error('Auth tables still missing after deploy/push:', finalPresence);
      process.exit(1);
    }

    console.log('Database schema OK. Migrations:', count);
  } catch (e: any) {
    console.error('Migration script failed:', e?.message || String(e));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


