import { Client as PgClient } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const pg = new PgClient({ connectionString: databaseUrl });
  await pg.connect();

  // 1) Ensure master tenant via upsert on slug
  try {
    await pg.query(
      `
      INSERT INTO public."Tenant"(name, slug, "updatedAt")
      VALUES ($1, $2, now())
      ON CONFLICT (slug) DO UPDATE SET "updatedAt" = now()
      `,
      ["Nexa Master Tenant", "nexa-master"]
    );
  } catch (err: any) {
    console.error("[ERROR] ensure master tenant:", err?.message || err);
  }

  // 2) discover actual tables and columns
  const tablesRes = await pg.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
  );
  const existingTables = new Set(tablesRes.rows.map((r) => r.table_name));

  async function hasTenantColumn(table: string): Promise<"tenant_id" | "tenantId" | null> {
    const cols = await pg.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [table]
    );
    const names = cols.rows.map((r) => r.column_name);
    if (names.includes("tenant_id")) return "tenant_id";
    if (names.includes("tenantId")) return "tenantId";
    return null;
  }

  const candidates = [
    "users",
    "user",
    "invoice",
    "invoices",
    "supplier",
    "suppliers",
    "purchase_order",
    "purchaseorder",
    "purchaseorders",
    "warehouse",
    "warehouses",
    "location",
    "locations",
    "inventory_item",
    "inventoryitems",
    "pos_sale",
    "pos_sales",
    "pos_line",
    "pos_lines",
    "employee",
    "employees",
    "audit_log",
    "audit_logs",
    "ledger",
    "ledgers",
    "bank_account",
    "bank_accounts",
    "kpi_snapshot",
    "kpi_snapshots",
    "fixed_asset",
    "fixed_assets",
  ];

  for (const t of candidates) {
    if (!existingTables.has(t)) {
      console.log(`[SKIP] ${t} not found`);
      continue;
    }
    try {
      const tenantCol = await hasTenantColumn(t);
      if (!tenantCol) {
        console.log(`[SKIP] ${t} has no tenant column`);
        continue;
      }
      const sql = `
        UPDATE public."${t}"
        SET ${tenantCol} = (SELECT id FROM public."Tenant" WHERE slug = 'nexa-master' LIMIT 1)
        WHERE ${tenantCol} IS NULL
      `;
      await pg.query(sql);
      console.log(`[OK] ${t} backfilled`);
    } catch (err: any) {
      console.error(`[ERROR] ${t} ${err?.message || err}`);
    }
  }

  await pg.end();
  console.log("TENANCY BACKFILL (final) COMPLETE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
