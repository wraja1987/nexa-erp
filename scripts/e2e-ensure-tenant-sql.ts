import { Client } from "pg";
async function main(){
  const db = new Client({ connectionString: process.env.DATABASE_URL! });
  const email = process.env.NEXA_E2E_EMAIL!;
  await db.connect();

  const u = await db.query('SELECT id FROM "User" WHERE email=$1', [email]);
  if (u.rows.length === 0) { console.error("User not found:", email); process.exit(1); }
  const userId = u.rows[0].id;

  let tenant = await db.query('SELECT id FROM "Tenant" LIMIT 1');
  if (tenant.rows.length === 0) {
    try { tenant = await db.query('INSERT INTO "Tenant"(name) VALUES($1) RETURNING id', ['Default Tenant']); }
    catch { tenant = await db.query('INSERT INTO "Tenant" DEFAULT VALUES RETURNING id'); }
    console.log("Created tenant:", tenant.rows[0].id);
  }
  const tenantId = tenant.rows[0].id;

  await db.query('UPDATE "User" SET tenant_id=$1 WHERE id=$2', [tenantId, userId]);
  console.log(`tenant_id set on ${email} → ${tenantId}`);
  await db.end();
}
main().catch(e=>{console.error(e);process.exit(1)});




