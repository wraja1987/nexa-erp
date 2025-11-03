import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DB URL (truncated) ---');
  const db = process.env.DATABASE_URL || '';
  console.log(db.slice(0, 80) + (db.length > 80 ? '...' : ''));

  // 1) list all non-system tables so we can SEE what actually exists
  const tables = await prisma.$queryRawUnsafe<{
    table_schema: string;
    table_name: string;
  }[]>(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
  `);

  console.log('--- TABLES (non-system) ---');
  console.log(JSON.stringify(tables, null, 2));

  // 2) define likely NextAuth table names
  const candidates = [
    // common Prisma/NextAuth names
    'Account', 'Session', 'User', 'VerificationToken',
    // plural/lowercase variants
    'Accounts', 'Sessions', 'Users', 'VerificationTokens',
    'account', 'accounts', 'session', 'sessions', 'user', 'users',
    // prefixed variants
    'nextauth_accounts', 'nextauth_sessions', 'nextauth_users', 'nextauth_verification_tokens',
    // ERP-shared/legacy names that sometimes get reused
    'AuthAccount', 'AuthAccounts', 'auth_accounts', 'auth_account'
  ];

  // 3) try to dump from the public schema for each candidate
  for (const name of candidates) {
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT *
        FROM "public"."${name}"
        ORDER BY 1 DESC
        LIMIT 25
      `);
      if (rows.length) {
        console.log(`--- public."${name}" (25) ---`);
        console.log(JSON.stringify(rows, null, 2));
      } else {
        console.log(`public."${name}" exists or queried but returned 0 rows.`);
      }
    } catch (err) {
      // table didn't exist in public – ignore
    }
  }

  // 4) print column layout for the table we ALREADY patched: public."Account"
  // this will confirm if this is the ERP table (code/name) or a true NextAuth table
  try {
    const accountCols = await prisma.$queryRawUnsafe<any[]>(`
      SELECT column_name, is_nullable, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Account'
      ORDER BY ordinal_position
    `);
    console.log('--- SCHEMA: public."Account" ---');
    console.log(JSON.stringify(accountCols, null, 2));
  } catch (err) {
    console.log('public."Account" not present or not readable');
  }

  // 5) sanity: show recent users, so we see the shape NextAuth is pairing with
  try {
    const users = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, email, role, active, tenant_id, "tenantId", created_at, "createdAt"
      FROM "public"."User"
      ORDER BY created_at DESC NULLS LAST, "createdAt" DESC NULLS LAST
      LIMIT 50
    `);
    console.log('--- public."User" (50) ---');
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.log('public."User" not present or not readable');
  }

  console.log('--- END INSPECT ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
