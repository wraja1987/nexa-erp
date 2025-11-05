import fs from "fs";
import path from "path";
import { Client } from "pg";

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

async function getOne(db: Client, table: string, email: string) {
  try {
    const { rows } = await db.query(`select id, email, active, role, tenant_id from ${table} where lower(email)=lower($1) limit 1`, [email]);
    return rows?.[0] || null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const url = resolveDb();
  if (!url) throw new Error("No DATABASE_URL found");
  const db = new Client({ connectionString: url });
  await db.connect();
  const emails = ["info@nexaai.co.uk", "wraja1987@gmail.com"];
  for (const email of emails) {
    const inUsers = await getOne(db, "public.users", email);
    const inUser = await getOne(db, '"User"', email);
    console.log(`CHECK ${email}: users=`, inUsers || null, ", User=", inUser || null);
  }
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


