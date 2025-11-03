import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cols(table: string) {
  return prisma.$queryRawUnsafe(`
    SELECT column_name, is_nullable, data_type, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = '${table}'
    ORDER BY ordinal_position
  `);
}

async function main() {
  console.log('--- PATCHING REAL DB ---');

  // accounts
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.accounts (
      id text,
      user_id text,
      type text,
      provider text,
      provider_account_id text,
      refresh_token text,
      access_token text,
      expires_at integer,
      token_type text,
      scope text,
      id_token text,
      session_state text
    )
  `).catch(() => {});

  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN user_id DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN provider DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN provider_account_id DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN type DROP NOT NULL`).catch(() => {});

  // sessions
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.sessions (
      id text,
      session_token text,
      user_id text,
      expires timestamp
    )
  `).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.sessions ALTER COLUMN session_token DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.sessions ALTER COLUMN user_id DROP NOT NULL`).catch(() => {});

  // users (ERP)
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN tenant_id DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN "tenantId" DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN password_hash DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN "passwordHash" DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN role DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN role SET DEFAULT 'USER'`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN active DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN active SET DEFAULT true`).catch(() => {});

  const accBefore = await cols('accounts');
  const sesBefore = await cols('sessions');

  console.log('--- accounts (after patch) ---');
  console.log(JSON.stringify(accBefore, null, 2));
  console.log('--- sessions (after patch) ---');
  console.log(JSON.stringify(sesBefore, null, 2));

  const accRows = await prisma.$queryRawUnsafe(`
    SELECT *
    FROM public.accounts
    ORDER BY 1 DESC
    LIMIT 50
  `);
  const sesRows = await prisma.$queryRawUnsafe(`
    SELECT *
    FROM public.sessions
    ORDER BY 1 DESC
    LIMIT 50
  `);

  console.log('--- ROWS: accounts ---');
  console.log(JSON.stringify(accRows, null, 2));
  console.log('--- ROWS: sessions ---');
  console.log(JSON.stringify(sesRows, null, 2));
}
main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
