import fs from "fs";
import path from "path";
import { Client } from "pg";
import bcrypt from "bcryptjs";

function resolveDb(): string {
  const tryRead = (p: string) => {
    try {
      const t = fs.readFileSync(p, "utf8");
      const m = t.match(/^DATABASE_URL=(.+)$/m);
      return m?.[1]?.trim() || null;
    } catch {}
    return null;
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

async function main() {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;
  const role = process.env.ROLE || "USER";
  const tenantId = process.env.TENANT_ID || "00000000-0000-0000-0000-000000000000";
  if (!email || !password) throw new Error("Set EMAIL and PASSWORD envs");

  const url = resolveDb();
  if (!url) throw new Error("No DATABASE_URL found");
  const db = new Client({ connectionString: url });
  await db.connect();
  try {
    const hash = await bcrypt.hash(password, 10);
    // Ensure public.users
    await db.query('CREATE TABLE IF NOT EXISTS public.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE)');
    await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password text');
    await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash text');
    await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tenant_id uuid');
    await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS active boolean DEFAULT true');
    await db.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text');
    await db.query(
      'INSERT INTO public.users(email,password,password_hash,active,role,tenant_id) VALUES($1,$2,$2,true,$3,$4) ON CONFLICT (email) DO UPDATE SET password=EXCLUDED.password,password_hash=EXCLUDED.password_hash,active=true,role=EXCLUDED.role,tenant_id=EXCLUDED.tenant_id',
      [email, hash, role, tenantId]
    );

    // Mirror to "User" for compatibility
    await db.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS password_hash text');
    const { rows } = await db.query('SELECT id FROM "User" WHERE lower(email)=lower($1) LIMIT 1', [email]);
    if (rows.length === 0) {
      await db.query('INSERT INTO "User"(email, password_hash, active, role, tenant_id) VALUES($1,$2,true,$3,$4)', [email, hash, role, tenantId]);
    } else {
      await db.query('UPDATE "User" SET password_hash=$1, active=true, role=$2, tenant_id=$3 WHERE lower(email)=lower($4)', [hash, role, tenantId, email]);
    }

    console.log("Upserted user:", email, "role:", role, "tenant:", tenantId);
  } finally {
    await db.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


