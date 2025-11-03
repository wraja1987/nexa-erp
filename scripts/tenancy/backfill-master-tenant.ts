import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const masterName = 'Nexa Master Tenant';

  // ensure master tenant
  let master = await prisma.tenant.findFirst({ where: { name: masterName } });
  if (!master) {
    master = await prisma.tenant.create({ data: { name: masterName } });
    console.log('Created master tenant:', master.id);
  } else {
    console.log('Master tenant exists:', master.id);
  }
  const masterId = master.id;

  // get all tables + columns so we only update columns that exist
  const rows: Array<{ table_name: string; column_name: string }> = await prisma.$queryRawUnsafe(
    `
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name IN ('tenant_id', 'tenantId')
    ORDER BY table_name, column_name;
    `,
  );

  // group per table
  const byTable: Record<string, string[]> = {};
  for (const r of rows) {
    if (!byTable[r.table_name]) byTable[r.table_name] = [];
    byTable[r.table_name].push(r.column_name);
  }

  console.log('Tenancy columns discovered:', byTable);

  for (const tableName of Object.keys(byTable)) {
    const cols = byTable[tableName];
    for (const col of cols) {
      const updated = await prisma.$executeRawUnsafe(
        `UPDATE "public"."${tableName}" SET "${col}" = $1 WHERE "${col}" IS NULL`,
        masterId,
      );
      console.log(`[${tableName}] (${col}) backfilled ${updated} rows`);
    }
  }

  console.log('Backfill complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
