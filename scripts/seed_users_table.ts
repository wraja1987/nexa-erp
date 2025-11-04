import fs from "fs";
import path from "path";
import { Client } from "pg";
import bcrypt from "bcryptjs";

function resolveDatabaseUrl(): string {
  const tryRead = (p: string): string | null => {
    try {
      const content = fs.readFileSync(p, "utf8");
      const match = content.match(/^DATABASE_URL=(.+)$/m);
      return match?.[1]?.trim() ?? null;
    } catch {
      return null;
    }
  };

  return (
    process.env.DATABASE_URL ||
    tryRead(path.join(process.cwd(), "apps/web/.env.local")) ||
    tryRead(path.join(process.cwd(), ".env.local")) ||
    tryRead(path.join(process.cwd(), "apps/web/.env")) ||
    tryRead(path.join(process.cwd(), ".env")) ||
    ""
  );
}

async function ensureUsersTableColumns(db: Client): Promise<void> {
  // Ensure the required columns exist on public.users
  // Avoid altering existing types; only add columns if missing.
  await db.query('CREATE SCHEMA IF NOT EXISTS public');
  await db.query('CREATE TABLE IF NOT EXISTS public.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE)');
  await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password text');
  await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash text');
  await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tenant_id uuid');
  await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS active boolean DEFAULT true');
  await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text');
}

async function upsertSuperAdmin(db: Client): Promise<void> {
  const email = "info@nexaai.co.uk";
  const password = "NexaSuper!123";
  const tenantId = "00000000-0000-0000-0000-000000000000";
  const role = "SUPER_ADMIN";

  const hashed = await bcrypt.hash(password, 10);

  const existing = await db.query(
    "SELECT id FROM public.users WHERE lower(email)=lower($1) LIMIT 1",
    [email]
  );

  if (existing.rows.length === 0) {
    // Insert with explicit columns; let default id populate if configured
    await db.query(
      `INSERT INTO public.users (email, password, password_hash, active, role, tenant_id)
       VALUES ($1, $2, $2, $3, $4, $5)`,
      [email, hashed, true, role, tenantId]
    );
    return;
  }

  // Update existing row
  await db.query(
    `UPDATE public.users
       SET password=$1,
           password_hash=$1,
           active=TRUE,
           role=$2,
           tenant_id=$3
     WHERE lower(email)=lower($4)`,
    [hashed, role, tenantId, email]
  );
}

async function main(): Promise<void> {
  const url = resolveDatabaseUrl();
  if (!url) {
    console.error("ERROR: DATABASE_URL not found in env or .env files");
    process.exit(2);
  }

  const db = new Client({ connectionString: url });
  await db.connect();
  try {
    await ensureUsersTableColumns(db);
    await upsertSuperAdmin(db);
    const { rows } = await db.query(
      `SELECT email, active, role, tenant_id, (password_hash IS NOT NULL) AS has_password_hash
       FROM public.users WHERE lower(email)=lower($1)`,
      ["info@nexaai.co.uk"]
    );
    console.log("users row:", rows[0] ?? null);
  } finally {
    await db.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


