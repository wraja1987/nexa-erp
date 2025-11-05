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

async function ensureMasterTenant(db: Client): Promise<string> {
  // Try to find any tenant first
  const any = await db.query('SELECT id FROM "Tenant" LIMIT 1');
  if (any.rows[0]?.id) return any.rows[0].id as string;
  // Create a master/default tenant
  const created = await db.query('INSERT INTO "Tenant"("name") VALUES($1) RETURNING id', ["Nexa Master Tenant"]);
  return created.rows[0].id as string;
}

async function backfill(db: Client, tenantId: string) {
  // Users table (Prisma model "User")
  try {
    await db.query('UPDATE "User" SET tenant_id=$1 WHERE tenant_id IS NULL', [tenantId]);
  } catch {}
  // Finance Account table (Prisma model Account)
  try {
    await db.query('UPDATE "Account" SET tenantId=$1 WHERE tenantId IS NULL', [tenantId]);
  } catch {}
}

async function main() {
  const url = resolveDb();
  if (!url) throw new Error("No DATABASE_URL found");
  const db = new Client({ connectionString: url });
  await db.connect();
  try {
    const tenantId = await ensureMasterTenant(db);
    await backfill(db, tenantId);
    console.log("Backfill complete. tenantId=", tenantId);
  } finally {
    await db.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


