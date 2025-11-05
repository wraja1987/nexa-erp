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
  if (!email || !password) throw new Error("Set EMAIL and PASSWORD envs");
  const url = resolveDb();
  if (!url) throw new Error("No DATABASE_URL found");
  const db = new Client({ connectionString: url });
  await db.connect();
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS password_hash text');
    await db.query('UPDATE "User" SET password_hash=$1, active=COALESCE(active,true) WHERE lower(email)=lower($2)', [hash, email]);
    await db.query('UPDATE public.users SET password_hash=$1, password=$1, active=true WHERE lower(email)=lower($2)', [hash, email]);
    console.log("Password set for", email);
  } finally {
    await db.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


