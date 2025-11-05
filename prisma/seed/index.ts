/* eslint-disable no-console */
import { PrismaClient, Prisma } from "@prisma/client";
import { monthStartUTC } from "@/lib/time/months" as any;

const prisma = new PrismaClient();

type Tenant = { id: string; code: string; name: string };

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function monthsBack(n: number): Date[] {
  const now = new Date();
  const months: Date[] = [];
  for (let i = n - 1; i >= 0; i--) months.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)));
  return months;
}

function amount(base: number, monthIndex: number, jitter: number = 0.15): Prisma.Decimal {
  const f = 1 + ((monthIndex % 12) / 12) * 0.4; // gentle upward trend
  const r = base * f;
  const j = r * (Math.random() * jitter * 2 - jitter);
  return new Prisma.Decimal(Math.max(0, Math.round((r + j) * 100)) / 100);
}

async function ensureTenant(name: string, code: string): Promise<Tenant> {
  const existing = await prisma.tenant.findFirst({ where: { name } });
  if (existing) return { id: existing.id, code, name: existing.name };
  const created = await prisma.tenant.create({ data: { name } });
  return { id: created.id, code, name };
}

async function seedFinance(tenant: Tenant, months: Date[]) {
  let i = 0;
  for (const d of months) {
    const key = monthKey(d);
    // Invoices
    for (let k = 0; k < 4; k++) {
      const number = `${tenant.code}-INV-${key}-${k + 1}`;
      await prisma.customerInvoice.upsert({
        where: { number },
        update: { total: amount(1200, i), tenantId: tenant.id },
        create: {
          tenantId: tenant.id,
          number,
          customerId: `${tenant.code}-CUS-001`,
          currency: "GBP",
          total: amount(1200, i),
          status: "posted",
          issuedAt: d,
        },
      });
    }
    // Bills
    for (let k = 0; k < 3; k++) {
      const number = `${tenant.code}-BILL-${key}-${k + 1}`;
      await prisma.supplierBill.upsert({
        where: { number },
        update: { total: amount(700, i), tenantId: tenant.id },
        create: {
          tenantId: tenant.id,
          number,
          supplierId: `${tenant.code}-SUP-001`,
          currency: "GBP",
          total: amount(700, i),
          status: "posted",
          receivedAt: d,
        },
      });
    }
    // Receipts
    await prisma.customerPayment.create({
      data: {
        tenantId: tenant.id,
        invoiceId: (await prisma.customerInvoice.findFirst({ where: { tenantId: tenant.id }, orderBy: { issuedAt: "desc" } }))!.id,
        amount: amount(600, i),
        paidAt: d,
        method: "card",
      },
    }).catch(() => {});
    i++;
  }
}

async function seedInventory(tenant: Tenant, months: Date[]) {
  // Basic items + monthly lots
  const sku = `${tenant.code}-SKU-001`;
  await prisma.inventoryItem.upsert({
    where: { id: `${tenant.code}-ITEM-001` },
    update: { tenantId: tenant.id, sku, qtyOnHand: new Prisma.Decimal(0) },
    create: { id: `${tenant.code}-ITEM-001`, tenantId: tenant.id, sku, qtyOnHand: new Prisma.Decimal(0) },
  });
  let qty = 0;
  let i = 0;
  for (const d of months) {
    const lotQty = new Prisma.Decimal(10 + (i % 5));
    const unitCost = new Prisma.Decimal(25 + (i % 3) * 2);
    qty += Number(lotQty);
    await prisma.inventoryLot.create({
      data: { tenantId: tenant.id, sku, qty: lotQty, unitCost, receivedAt: d },
    }).catch(() => {});
    i++;
  }
}

async function seedManufacturing(tenant: Tenant, months: Date[]) {
  let i = 0;
  for (const d of months) {
    await prisma.workOrder.create({
      data: {
        tenantId: tenant.id,
        number: `${tenant.code}-WO-${monthKey(d)}`,
        itemCode: `${tenant.code}-SKU-001`,
        quantity: new Prisma.Decimal(5 + (i % 3)),
        status: "completed",
        startPlanned: d,
        endPlanned: d,
        startActual: d,
        endActual: d,
      },
    }).catch(() => {});
    i++;
  }
}

async function seedPos(tenant: Tenant, months: Date[]) {
  const store = await prisma.store.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: `${tenant.code}-STORE-1` } as any },
    update: {},
    create: { tenantId: tenant.id, code: `${tenant.code}-STORE-1`, name: `${tenant.name} Store` },
  });
  let i = 0;
  for (const d of months) {
    const saleNumber = `${tenant.code}-SALE-${monthKey(d)}`;
    await prisma.posSale.upsert({
      where: { tenantId_saleNumber: { tenantId: tenant.id, saleNumber } as any },
      update: {},
      create: {
        tenantId: tenant.id,
        storeId: store.id,
        cashierUserId: "seed",
        saleNumber,
        status: "paid",
        subtotal: amount(2000, i),
        tax: amount(400, i),
        total: amount(2400, i),
        currency: "GBP",
        createdAt: startOfMonth(d),
        lines: {
          create: [
            { tenantId: tenant.id, sku: `${tenant.code}-SKU-001`, name: "Item A", qty: new Prisma.Decimal(2), unitPrice: new Prisma.Decimal(1000), lineTotal: new Prisma.Decimal(2000) },
          ],
        },
        payments: {
          create: [
            { tenantId: tenant.id, method: "card", amount: new Prisma.Decimal(2400) },
          ],
        },
      },
    }).catch(() => {});
    i++;
  }
}

async function seedHr(tenant: Tenant, months: Date[]) {
  const emp = await prisma.employee.upsert({
    where: { empNo: `${tenant.code}-E001` },
    update: { tenantId: tenant.id, firstName: "Demo", lastName: "Employee" },
    create: { tenantId: tenant.id, empNo: `${tenant.code}-E001`, firstName: "Demo", lastName: "Employee" },
  });
  const schedule = await prisma.paySchedule.upsert({
    where: { id: `${tenant.code}-SCHED-MONTHLY` },
    update: {},
    create: { id: `${tenant.code}-SCHED-MONTHLY`, tenantId: tenant.id, name: "Monthly", frequency: "monthly" },
  });
  for (const d of months) {
    const run = await prisma.payrollRun.upsert({
      where: { id: `${tenant.code}-RUN-${monthKey(d)}` },
      update: {},
      create: { id: `${tenant.code}-RUN-${monthKey(d)}`, tenantId: tenant.id, scheduleId: schedule.id, periodStart: d, periodEnd: d, status: "posted" },
    });
    const psId = `${tenant.code}-PS-${monthKey(d)}`;
    await prisma.payslip.upsert({
      where: { id: psId },
      update: { grossPay: new Prisma.Decimal(300000), netPay: new Prisma.Decimal(230000), tenantId: tenant.id, runId: run.id, employeeId: emp.id },
      create: { id: psId, tenantId: tenant.id, runId: run.id, employeeId: emp.id, grossPay: new Prisma.Decimal(300000), netPay: new Prisma.Decimal(230000) },
    }).catch(() => {});
  }
}

async function main() {
  const months = monthsBack(12);
  const master = await ensureTenant("Nexa Master Tenant", "MASTER");
  const tenants: Tenant[] = [master];
  if (process.env.SEED_ENABLE_DEMO === 'true' || process.env.NODE_ENV !== 'production') {
    const demo = await ensureTenant("Demo Tenant", "DEMO");
    tenants.push(demo);
  }
  if (process.env.NODE_ENV === 'production' && process.env.SEED_ENABLE_DEMO !== 'true') {
    console.log('Skipping demo seeding in production (SEED_ENABLE_DEMO not true)');
  }

  for (const tenant of tenants) {
    await seedFinance(tenant, months);
    await seedInventory(tenant, months);
    await seedManufacturing(tenant, months);
    await seedPos(tenant, months);
    await seedHr(tenant, months);
  }

  console.log("Seed complete for tenants:", master.name, demo.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


