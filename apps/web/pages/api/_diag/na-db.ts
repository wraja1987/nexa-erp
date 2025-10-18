import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient();
  const out: any = { ok: true, hasTables: {}, migrations: 0 };
  try {
    const [{ count }] = await prisma.$queryRawUnsafe<any[]>(
      'SELECT COUNT(*)::int AS count FROM "_prisma_migrations"'
    ).catch(() => [{ count: 0 }]);
    out.migrations = count;

    const presenceSql = `
      SELECT 
        (to_regclass('public."User"') IS NOT NULL) AS "User",
        (to_regclass('public."Account"') IS NOT NULL) AS "Account",
        (to_regclass('public."Session"') IS NOT NULL) AS "Session",
        (to_regclass('public."VerificationToken"') IS NOT NULL) AS "VerificationToken"
    `;
    const [presence] = await prisma.$queryRawUnsafe<any[]>(presenceSql)
      .catch(() => [{ User: false, Account: false, Session: false, VerificationToken: false }]);

    out.hasTables = presence;
    out.ok = Boolean(presence?.User && presence?.Account && presence?.Session && presence?.VerificationToken);
  } catch (e: any) {
    out.ok = false;
    out.error = e?.message || String(e);
  } finally {
    await prisma.$disconnect();
  }
  res.status(out.ok ? 200 : 500).json(out);
}


