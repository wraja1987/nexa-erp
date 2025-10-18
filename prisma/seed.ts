import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function ensureCompatColumns() {
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='password_hash'
      ) THEN
        ALTER TABLE "User" ADD COLUMN password_hash TEXT;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='is_active'
      ) THEN
        ALTER TABLE "User" ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='emailVerified'
      ) THEN
        ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMPTZ;
      END IF;
    END $$;
  `);
}

async function upsertUser(email: string, password: string, role: string, tenantId: string){
  const hash = await bcrypt.hash(password, 12);
  const now = new Date();
  const existing = await prisma.user.findUnique({ where: { email } }).catch(() => null);
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role, active: true as any, mfaEnabled: true as any, passwordHash: hash as any }
    } as any);
  } else {
    await prisma.user.create({
      data: { tenant_id: tenantId as any, email, role, active: true as any, mfaEnabled: true as any, passwordHash: hash as any }
    } as any);
  }
  // Keep raw-compat fields in sync for NextAuth Credentials authorize() query
  await prisma.$executeRawUnsafe(
    `UPDATE "User" SET password_hash=$1, is_active=TRUE, "emailVerified"=$2 WHERE email=$3`,
    hash,
    now,
    email
  );
}

async function seedFinance(tenantId: string) {
  // Accounts
  const accounts = [
    { code: '1000', name: 'Cash', type: 'asset' },
    { code: '1100', name: 'Bank', type: 'asset' },
    { code: '2000', name: 'Accounts Payable', type: 'liability' },
    { code: '3000', name: 'Revenue', type: 'income' },
    { code: '4000', name: 'COGS', type: 'expense' },
  ];
  for (const a of accounts) {
    await prisma.account.upsert({
      where: { tenantId_code: { tenantId, code: a.code } } as any,
      update: {},
      create: { tenantId, code: a.code, name: a.name, type: a.type } as any,
    } as any);
  }

  // Customer invoices
  for (let i = 0; i < 20; i++) {
    await prisma.customerInvoice.create({
      data: {
        tenantId,
        number: `INV-${1000 + i}`,
        customerId: faker.string.uuid(),
        total: new prisma.Prisma.Decimal(faker.number.float({ min: 150, max: 2500, multipleOf: 0.01 }).toFixed(2)),
        currency: 'GBP',
        status: faker.helpers.arrayElement(['draft', 'sent', 'paid']),
      } as any,
    } as any);
  }

  // Supplier bills
  for (let i = 0; i < 15; i++) {
    await prisma.supplierBill.create({
      data: {
        tenantId,
        number: `BILL-${800 + i}`,
        supplierId: faker.string.uuid(),
        total: new prisma.Prisma.Decimal(faker.number.float({ min: 50, max: 1500, multipleOf: 0.01 }).toFixed(2)),
        currency: 'GBP',
        status: faker.helpers.arrayElement(['draft', 'approved', 'paid']),
      } as any,
    } as any);
  }

  // KPIs visible in tables
  for (let i = 0; i < 12; i++) {
    const month = faker.date.recent({ days: 365 });
    await prisma.kpiSnapshot.create({
      data: { id: faker.string.uuid(), tenantId, name: 'finance:invoices', value: new prisma.Prisma.Decimal(faker.number.float({ min: 5000, max: 20000 }).toFixed(2)), asOf: month } as any,
    } as any);
    await prisma.kpiSnapshot.create({
      data: { id: faker.string.uuid(), tenantId, name: 'finance:bills', value: new prisma.Prisma.Decimal(faker.number.float({ min: 2000, max: 10000 }).toFixed(2)), asOf: month } as any,
    } as any);
    await prisma.kpiSnapshot.create({
      data: { id: faker.string.uuid(), tenantId, name: 'finance:payments', value: new prisma.Prisma.Decimal(faker.number.float({ min: 3000, max: 15000 }).toFixed(2)), asOf: month } as any,
    } as any);
  }
}

async function seedInventory(tenantId: string) {
  const wh = await prisma.warehouse.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: { tenantId, code: 'MAIN', name: 'Main Warehouse' },
  } as any);

  for (let i = 0; i < 25; i++) {
    await prisma.inventoryItem.create({
      data: {
        tenantId,
        sku: `SKU-${1000 + i}`,
        qtyOnHand: new prisma.Prisma.Decimal(faker.number.int({ min: 0, max: 500 })),
        warehouseId: wh.id,
      } as any,
    } as any);
  }

  for (let i = 0; i < 10; i++) {
    await prisma.kpiSnapshot.create({
      data: { id: faker.string.uuid(), tenantId, name: 'inventory:items', value: new prisma.Prisma.Decimal(faker.number.int({ min: 50, max: 500 })), asOf: faker.date.recent({ days: 365 }) } as any,
    } as any);
  }
}

async function seedManufacturing(tenantId: string) {
  for (let i = 0; i < 10; i++) {
    await prisma.workOrder.create({
      data: {
        number: `WO-${100 + i}`,
        tenantId,
        itemCode: `SKU-${1000 + i}`,
        quantity: new prisma.Prisma.Decimal(faker.number.int({ min: 10, max: 200 })),
      } as any,
    } as any);
  }
  for (let i = 0; i < 8; i++) {
    await prisma.kpiSnapshot.create({ data: { id: faker.string.uuid(), tenantId, name: 'mfg:wo', value: new prisma.Prisma.Decimal(faker.number.int({ min: 5, max: 40 })), asOf: faker.date.recent({ days: 365 }) } as any } as any);
  }
}

async function seedSales(tenantId: string) {
  for (let i = 0; i < 30; i++) {
    await prisma.kpiSnapshot.create({ data: { id: faker.string.uuid(), tenantId, name: 'sales:leads', value: new prisma.Prisma.Decimal(faker.number.int({ min: 1, max: 10 })), asOf: faker.date.recent({ days: 120 }) } as any } as any);
  }
}

async function seedProjects(tenantId: string) {
  const tags = ['boards','tasks','time','billing','reports'];
  for (let i = 0; i < 20; i++) {
    const t = faker.helpers.arrayElement(tags);
    await prisma.kpiSnapshot.create({ data: { id: faker.string.uuid(), tenantId, name: `projects:${t}`, value: new prisma.Prisma.Decimal(faker.number.int({ min: 1, max: 20 })), asOf: faker.date.recent({ days: 200 }) } as any } as any);
  }
}

async function seedHR(tenantId: string) {
  for (let i = 0; i < 20; i++) {
    await prisma.employee.create({
      data: { tenantId, empNo: `E${1000 + i}`, firstName: faker.person.firstName(), lastName: faker.person.lastName(), email: faker.internet.email() } as any,
    } as any);
  }
}

async function seedPOS(tenantId: string) {
  await prisma.kpiSnapshot.create({ data: { id: faker.string.uuid(), tenantId, name: 'pos:receipts', value: new prisma.Prisma.Decimal(faker.number.float({ min: 10, max: 2000 }).toFixed(2)), asOf: new Date() } as any } as any);
}

async function seedAI(tenantId: string) {
  for (let i = 0; i < 10; i++) {
    await prisma.kpiSnapshot.create({ data: { id: faker.string.uuid(), tenantId, name: 'ai:documents', value: new prisma.Prisma.Decimal(faker.number.int({ min: 1, max: 30 })), asOf: faker.date.recent({ days: 90 }) } as any } as any);
  }
}

async function seedAll(tenantId: string) {
  await seedFinance(tenantId);
  await seedInventory(tenantId);
  await seedManufacturing(tenantId);
  await seedSales(tenantId);
  await seedProjects(tenantId);
  await seedHR(tenantId);
  await seedPOS(tenantId);
  await seedAI(tenantId);
}

async function main(){
  await ensureCompatColumns();
  const tenant = await prisma.tenant.upsert({
    where: { id: "tenant-nexa" },
    update: {},
    create: { id: "tenant-nexa", name: "Nexa" }
  });
  await upsertUser("info@nexaai.co.uk", "Wolfish123", "superadmin", tenant.id);
  await upsertUser("wraja1987@gmail.com", "Wolfish123", "admin", tenant.id);
  await seedAll(tenant.id);
  console.log("Seed complete: users activated, base data present.");
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());


