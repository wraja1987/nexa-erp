import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function ensureTable(name: string) {
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT column_name, is_nullable, data_type, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = '${name}'
    ORDER BY ordinal_position
  `);
  return rows;
}

async function main() {
  console.log('--- START: patch lowercase NextAuth tables ---');

  // 1) inspect what we really have
  const accountsCols = await ensureTable('accounts');
  const sessionsCols = await ensureTable('sessions');
  const vtCols       = await ensureTable('verification_token');

  console.log('--- public.accounts (before) ---');
  console.log(JSON.stringify(accountsCols, null, 2));
  console.log('--- public.sessions (before) ---');
  console.log(JSON.stringify(sessionsCols, null, 2));
  console.log('--- public.verification_token (before) ---');
  console.log(JSON.stringify(vtCols, null, 2));

  // 2) bring public.accounts to NextAuth shape
  //    NextAuth expects roughly:
  //    - id (text/uuid)                          [Prisma usually]
  //    - user_id (text)                          ← link to users.id
  //    - type (text)
  //    - provider (text)
  //    - provider_account_id (text)
  //    - refresh_token/access_token/expires_at/token_type/scope/id_token/session_state
  //    Your table had ERP-style cols on public."Account" but NOT here.
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.accounts
    ADD COLUMN IF NOT EXISTS id text,
    ADD COLUMN IF NOT EXISTS user_id text,
    ADD COLUMN IF NOT EXISTS type text,
    ADD COLUMN IF NOT EXISTS provider text,
    ADD COLUMN IF NOT EXISTS provider_account_id text,
    ADD COLUMN IF NOT EXISTS refresh_token text,
    ADD COLUMN IF NOT EXISTS access_token text,
    ADD COLUMN IF NOT EXISTS expires_at integer,
    ADD COLUMN IF NOT EXISTS token_type text,
    ADD COLUMN IF NOT EXISTS scope text,
    ADD COLUMN IF NOT EXISTS id_token text,
    ADD COLUMN IF NOT EXISTS session_state text
  `);

  // make sure the important ones are nullable – NextAuth will populate them
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN user_id DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN provider_account_id DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN provider DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN type DROP NOT NULL`).catch(() => {});

  // 3) some earlier ERP migrations may have shoved code/name/tenant_id into this table.
  //    Soften them if they exist.
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN code DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN name DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN tenant_id DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.accounts ALTER COLUMN "tenantId" DROP NOT NULL`).catch(() => {});

  // 4) do the same for sessions – make sure it matches NextAuth expectations
  //    typically:
  //    - id (text)
  //    - session_token (text) UNIQUE
  //    - user_id (text)
  //    - expires (timestamp)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.sessions
    ADD COLUMN IF NOT EXISTS id text,
    ADD COLUMN IF NOT EXISTS session_token text,
    ADD COLUMN IF NOT EXISTS user_id text,
    ADD COLUMN IF NOT EXISTS expires timestamp
  `);
  await prisma.$executeRawUnsafe(`ALTER TABLE public.sessions ALTER COLUMN user_id DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public.sessions ALTER COLUMN session_token DROP NOT NULL`).catch(() => {});

  // 5) users: keep relaxed so OAuth-created users don’t die on insert
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN tenant_id DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN "tenantId" DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN password_hash DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN "passwordHash" DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN role DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN role SET DEFAULT 'USER'`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN active DROP NOT NULL`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE public."User" ALTER COLUMN active SET DEFAULT true`).catch(() => {});

  // 6) re-dump to confirm shape
  const accountsAfter = await ensureTable('accounts');
  const sessionsAfter = await ensureTable('sessions');

  console.log('--- public.accounts (after) ---');
  console.log(JSON.stringify(accountsAfter, null, 2));
  console.log('--- public.sessions (after) ---');
  console.log(JSON.stringify(sessionsAfter, null, 2));

  // 7) show current rows (if any) – BEFORE you re-click Google
  const accRows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT *
    FROM public.accounts
    ORDER BY 1 DESC
    LIMIT 50
  `);
  console.log('--- ROWS: public.accounts ---');
  console.log(JSON.stringify(accRows, null, 2));

  const sessRows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT *
    FROM public.sessions
    ORDER BY 1 DESC
    LIMIT 50
  `);
  console.log('--- ROWS: public.sessions ---');
  console.log(JSON.stringify(sessRows, null, 2));

  console.log('--- DONE: patch lowercase NextAuth tables ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
