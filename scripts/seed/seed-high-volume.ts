#!/usr/bin/env tsx
/**
 * High-Volume Seed Script — Generates 100k-500k rows of realistic demo data.
 *
 * SAFETY GUARDS:
 * - Requires NEXA_ALLOW_HIGH_VOLUME_SEED=true
 * - Refuses to run if DATABASE_URL points to production
 * - All inserts respect tenant scoping and foreign keys
 *
 * Usage:
 *   NEXA_ALLOW_HIGH_VOLUME_SEED=true DATABASE_URL=postgresql://... tsx scripts/seed/seed-high-volume.ts
 */

/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TENANT_ID = "t-high-volume-demo-0001";

// Safety guard: require explicit flag
if (process.env.NEXA_ALLOW_HIGH_VOLUME_SEED !== "true") {
  console.error("❌ NEXA_ALLOW_HIGH_VOLUME_SEED is not set to 'true'");
  console.error("   This script requires explicit permission to run.");
  console.error("   Set: export NEXA_ALLOW_HIGH_VOLUME_SEED=true");
  process.exit(1);
}

// Safety guard: check for production markers
const dbUrl = process.env.DATABASE_URL || "";
const prodMarkers = ["production", "prod", "prd", "live", "main"];
const isProduction = prodMarkers.some((marker) => dbUrl.toLowerCase().includes(marker));

if (isProduction) {
  console.error("❌ DATABASE_URL appears to point to production!");
  console.error("   This script must NOT run against production.");
  console.error("   Current DATABASE_URL contains production markers.");
  process.exit(1);
}

// Check NODE_ENV as additional guard
if (process.env.NODE_ENV === "production") {
  console.error("❌ NODE_ENV is set to 'production'");
  console.error("   This script must NOT run in production environment.");
  process.exit(1);
}

console.log("✅ Safety guards passed");
console.log(`📊 Target tenant: ${TENANT_ID}`);
console.log("");

// Helper: Generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper: Generate random string
function randomString(length: number): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

// Helper: Generate random number in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Generate random decimal
function randomDecimal(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

async function ensureTenant() {
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    create: { id: TENANT_ID, name: "High Volume Demo Tenant" },
    update: {},
  });
}

async function seedFinance(count: number) {
  console.log(`📝 Seeding ${count} finance documents...`);

  const startDate = new Date("2023-01-01");
  const endDate = new Date();

  // Create customers/suppliers first (smaller set)
  const customerIds: string[] = [];
  const supplierIds: string[] = [];

  for (let i = 0; i < 100; i++) {
    const customerId = `cust-${i.toString().padStart(4, "0")}`;
    customerIds.push(customerId);
  }

  for (let i = 0; i < 50; i++) {
    const supplierId = `supp-${i.toString().padStart(4, "0")}`;
    supplierIds.push(supplierId);
  }

  // Seed CustomerInvoices
  const invoiceCount = Math.floor(count * 0.4); // 40% invoices
  const invoices = [];
  for (let i = 0; i < invoiceCount; i++) {
    const customerId = customerIds[randomInt(0, customerIds.length - 1)];
    const total = randomDecimal(100, 10000);
    const issuedAt = randomDate(startDate, endDate);
    const dueAt = new Date(issuedAt.getTime() + randomInt(7, 60) * 24 * 60 * 60 * 1000);

    invoices.push({
      tenantId: TENANT_ID,
      number: `INV-${(i + 1).toString().padStart(6, "0")}`,
      customerId,
      currency: "GBP",
      total,
      status: i % 10 === 0 ? "paid" : i % 5 === 0 ? "overdue" : "draft",
      issuedAt,
      dueAt,
    });
  }

  // Batch insert invoices
  let inserted = 0;
  const batchSize = 1000;
  for (let i = 0; i < invoices.length; i += batchSize) {
    const batch = invoices.slice(i, i + batchSize);
    await prisma.customerInvoice.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if (inserted % 10000 === 0) {
      console.log(`   ✅ Inserted ${inserted} invoices...`);
    }
  }

  // Seed SupplierBills
  const billCount = Math.floor(count * 0.3); // 30% bills
  const bills = [];
  for (let i = 0; i < billCount; i++) {
    const supplierId = supplierIds[randomInt(0, supplierIds.length - 1)];
    const total = randomDecimal(50, 5000);
    const receivedAt = randomDate(startDate, endDate);
    const dueAt = new Date(receivedAt.getTime() + randomInt(14, 90) * 24 * 60 * 60 * 1000);

    bills.push({
      tenantId: TENANT_ID,
      number: `BILL-${(i + 1).toString().padStart(6, "0")}`,
      supplierId,
      currency: "GBP",
      total,
      status: i % 10 === 0 ? "paid" : "draft",
      receivedAt,
      dueAt,
    });
  }

  inserted = 0;
  for (let i = 0; i < bills.length; i += batchSize) {
    const batch = bills.slice(i, i + batchSize);
    await prisma.supplierBill.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if (inserted % 10000 === 0) {
      console.log(`   ✅ Inserted ${inserted} bills...`);
    }
  }

  // Seed JournalEntries (20% of count)
  const journalCount = Math.floor(count * 0.2);
  const journals = [];
  for (let i = 0; i < journalCount; i++) {
    const postedAt = randomDate(startDate, endDate);
    journals.push({
      tenantId: TENANT_ID,
      docRef: `JE-${(i + 1).toString().padStart(6, "0")}`,
      memo: `Journal entry ${i + 1}`,
      postedAt,
    });
  }

  inserted = 0;
  for (let i = 0; i < journals.length; i += batchSize) {
    const batch = journals.slice(i, i + batchSize);
    const created = await prisma.journalEntry.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += created.count;
    if (inserted % 10000 === 0) {
      console.log(`   ✅ Inserted ${inserted} journal entries...`);
    }
  }

  // Seed CustomerPayments (10% of count)
  const paymentCount = Math.floor(count * 0.1);
  const invoiceNumbers = invoices.slice(0, Math.min(1000, invoices.length)).map((inv) => inv.number);
  const payments = [];
  for (let i = 0; i < paymentCount; i++) {
    const invoiceNumber = invoiceNumbers[randomInt(0, invoiceNumbers.length - 1)];
    const invoice = await prisma.customerInvoice.findUnique({ where: { number: invoiceNumber } });
    if (!invoice) continue;

    payments.push({
      tenantId: TENANT_ID,
      invoiceId: invoice.id,
      amount: randomDecimal(50, Number(invoice.total)),
      paidAt: randomDate(new Date(invoice.issuedAt), endDate),
      method: i % 3 === 0 ? "card" : i % 2 === 0 ? "bank_transfer" : "cash",
      reference: `PAY-${randomString(8)}`,
    });
  }

  inserted = 0;
  for (let i = 0; i < payments.length; i += batchSize) {
    const batch = payments.slice(i, i + batchSize);
    await prisma.customerPayment.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if (inserted % 5000 === 0) {
      console.log(`   ✅ Inserted ${inserted} payments...`);
    }
  }

  return { invoices: invoiceCount, bills: billCount, journals: journalCount, payments: paymentCount };
}

async function seedInventory(count: number) {
  console.log(`📦 Seeding ${count} inventory records...`);

  // Create warehouses first
  const warehouses = [];
  for (let i = 0; i < 5; i++) {
    const wh = await prisma.warehouse.upsert({
      where: { code: `WH-${i + 1}` },
      create: {
        tenantId: TENANT_ID,
        code: `WH-${i + 1}`,
        name: `Warehouse ${i + 1}`,
      },
      update: {},
    });
    warehouses.push(wh);
  }

  // Seed InventoryItems
  const itemCount = Math.floor(count * 0.3);
  const items = [];
  for (let i = 0; i < itemCount; i++) {
    const warehouse = warehouses[randomInt(0, warehouses.length - 1)];
    items.push({
      tenantId: TENANT_ID,
      sku: `SKU-${(i + 1).toString().padStart(6, "0")}`,
      qtyOnHand: randomDecimal(0, 1000),
      warehouseId: warehouse.id,
    });
  }

  let inserted = 0;
  const batchSize = 1000;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await prisma.inventoryItem.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if (inserted % 10000 === 0) {
      console.log(`   ✅ Inserted ${inserted} inventory items...`);
    }
  }

  // Seed InventoryLots
  const lotCount = Math.floor(count * 0.2);
  const skus = items.slice(0, Math.min(5000, items.length)).map((item) => item.sku);
  const lots = [];
  for (let i = 0; i < lotCount; i++) {
    const sku = skus[randomInt(0, skus.length - 1)];
    const warehouse = warehouses[randomInt(0, warehouses.length - 1)];
    lots.push({
      tenantId: TENANT_ID,
      sku,
      qty: randomDecimal(1, 500),
      unitCost: randomDecimal(1, 100),
      receivedAt: randomDate(new Date("2023-01-01"), new Date()),
      warehouseId: warehouse.id,
    });
  }

  inserted = 0;
  for (let i = 0; i < lots.length; i += batchSize) {
    const batch = lots.slice(i, i + batchSize);
    await prisma.inventoryLot.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if (inserted % 10000 === 0) {
      console.log(`   ✅ Inserted ${inserted} inventory lots...`);
    }
  }

  return { items: itemCount, lots: lotCount };
}

async function seedHR(count: number) {
  console.log(`👥 Seeding ${count} HR/Payroll records...`);

  // Create employees first
  const employeeCount = Math.min(500, Math.floor(count * 0.1));
  const employees = [];
  for (let i = 0; i < employeeCount; i++) {
    const emp = await prisma.employee.create({
      data: {
        tenantId: TENANT_ID,
        empNo: `EMP-${(i + 1).toString().padStart(5, "0")}`,
        firstName: `Employee${i + 1}`,
        lastName: `Last${i + 1}`,
        email: `emp${i + 1}@demo.nexaai.co.uk`,
      },
    });
    employees.push(emp);
    if ((i + 1) % 100 === 0) {
      console.log(`   ✅ Created ${i + 1} employees...`);
    }
  }

  // Create pay schedule
  const schedule = await prisma.paySchedule.upsert({
    where: { id: "schedule-monthly" },
    create: {
      id: "schedule-monthly",
      tenantId: TENANT_ID,
      name: "Monthly",
      frequency: "monthly",
    },
    update: {},
  });

  // Seed PayrollRuns
  const runCount = Math.floor(count * 0.05);
  const startDate = new Date("2023-01-01");
  const endDate = new Date();
  const runs = [];
  for (let i = 0; i < runCount; i++) {
    const periodStart = randomDate(startDate, endDate);
    const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
    runs.push({
      tenantId: TENANT_ID,
      scheduleId: schedule.id,
      periodStart,
      periodEnd,
      status: i % 5 === 0 ? "posted" : "draft",
    });
  }

  let inserted = 0;
  const batchSize = 100;
  for (let i = 0; i < runs.length; i += batchSize) {
    const batch = runs.slice(i, i + batchSize);
    const created = await prisma.payrollRun.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += created.count;
    if (inserted % 1000 === 0) {
      console.log(`   ✅ Inserted ${inserted} payroll runs...`);
    }
  }

  // Seed Payslips (for each run, create payslips for subset of employees)
  const runIds = await prisma.payrollRun.findMany({
    where: { tenantId: TENANT_ID },
    select: { id: true },
    take: Math.min(1000, inserted),
  });

  const payslipCount = Math.min(runIds.length * 10, Math.floor(count * 0.15)); // Up to 10 payslips per run
  const payslips = [];
  for (let i = 0; i < payslipCount; i++) {
    const run = runIds[randomInt(0, runIds.length - 1)];
    const employee = employees[randomInt(0, employees.length - 1)];
    const grossPay = randomDecimal(2000, 8000);
    const netPay = grossPay * 0.75; // Approximate

    payslips.push({
      tenantId: TENANT_ID,
      runId: run.id,
      employeeId: employee.id,
      grossPay,
      netPay,
    });
  }

  inserted = 0;
  for (let i = 0; i < payslips.length; i += batchSize) {
    const batch = payslips.slice(i, i + batchSize);
    await prisma.payslip.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if (inserted % 5000 === 0) {
      console.log(`   ✅ Inserted ${inserted} payslips...`);
    }
  }

  return { employees: employeeCount, runs: runCount, payslips: inserted };
}

async function seedManufacturing(count: number) {
  console.log(`🏭 Seeding ${count} manufacturing records...`);

  const workOrderCount = Math.floor(count * 0.1);
  const startDate = new Date("2023-01-01");
  const endDate = new Date();
  const workOrders = [];

  for (let i = 0; i < workOrderCount; i++) {
    const startPlanned = randomDate(startDate, endDate);
    const endPlanned = new Date(startPlanned.getTime() + randomInt(1, 14) * 24 * 60 * 60 * 1000);
    workOrders.push({
      tenantId: TENANT_ID,
      number: `WO-${(i + 1).toString().padStart(6, "0")}`,
      itemCode: `ITEM-${randomInt(1, 1000).toString().padStart(4, "0")}`,
      quantity: randomDecimal(1, 100),
      status: i % 10 === 0 ? "completed" : i % 5 === 0 ? "released" : "planned",
      startPlanned,
      endPlanned,
    });
  }

  let inserted = 0;
  const batchSize = 1000;
  for (let i = 0; i < workOrders.length; i += batchSize) {
    const batch = workOrders.slice(i, i + batchSize);
    await prisma.workOrder.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if (inserted % 10000 === 0) {
      console.log(`   ✅ Inserted ${inserted} work orders...`);
    }
  }

  return { workOrders: inserted };
}

async function seedPurchasing(count: number) {
  console.log(`🛒 Seeding ${count} purchasing records...`);

  // Create suppliers first
  const supplierCount = 100;
  const suppliers = [];
  for (let i = 0; i < supplierCount; i++) {
    const supp = await prisma.supplier.upsert({
      where: { code: `SUPP-${(i + 1).toString().padStart(4, "0")}` },
      create: {
        tenantId: TENANT_ID,
        code: `SUPP-${(i + 1).toString().padStart(4, "0")}`,
        name: `Supplier ${i + 1}`,
        email: `supplier${i + 1}@demo.nexaai.co.uk`,
      },
      update: {},
    });
    suppliers.push(supp);
  }

  // Seed PurchaseOrders
  const poCount = Math.floor(count * 0.15);
  const startDate = new Date("2023-01-01");
  const endDate = new Date();
  const pos = [];

  for (let i = 0; i < poCount; i++) {
    const supplier = suppliers[randomInt(0, suppliers.length - 1)];
    const orderDate = randomDate(startDate, endDate);
    const expectedAt = new Date(orderDate.getTime() + randomInt(7, 60) * 24 * 60 * 60 * 1000);

    pos.push({
      tenantId: TENANT_ID,
      number: `PO-${(i + 1).toString().padStart(6, "0")}`,
      supplierId: supplier.id,
      currency: "GBP",
      orderDate,
      expectedAt,
      status: i % 10 === 0 ? "received" : i % 5 === 0 ? "sent" : "draft",
    });
  }

  let inserted = 0;
  const batchSize = 1000;
  for (let i = 0; i < pos.length; i += batchSize) {
    const batch = pos.slice(i, i + batchSize);
    await prisma.purchaseOrder.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if (inserted % 10000 === 0) {
      console.log(`   ✅ Inserted ${inserted} purchase orders...`);
    }
  }

  return { suppliers: supplierCount, pos: inserted };
}

async function seedBanking(count: number) {
  console.log(`🏦 Seeding ${count} banking records...`);

  // Create bank accounts first
  const accountCount = 5;
  const accounts = [];
  for (let i = 0; i < accountCount; i++) {
    const acc = await prisma.bankAccount.upsert({
      where: { tenantId_code: { tenantId: TENANT_ID, code: `BANK-${i + 1}` } },
      create: {
        tenantId: TENANT_ID,
        code: `BANK-${i + 1}`,
        name: `Bank Account ${i + 1}`,
        currency: "GBP",
      },
      update: {},
    });
    accounts.push(acc);
  }

  // Seed BankStatementLines
  const lineCount = Math.floor(count * 0.2);
  const startDate = new Date("2023-01-01");
  const endDate = new Date();
  const lines = [];

  for (let i = 0; i < lineCount; i++) {
    const account = accounts[randomInt(0, accounts.length - 1)];
    const date = randomDate(startDate, endDate);
    lines.push({
      tenantId: TENANT_ID,
      bankAccountId: account.id,
      date,
      description: `Transaction ${i + 1}`,
      amount: randomDecimal(-10000, 10000),
      reference: `REF-${randomString(8)}`,
      reconciled: i % 10 === 0,
    });
  }

  let inserted = 0;
  const batchSize = 1000;
  for (let i = 0; i < lines.length; i += batchSize) {
    const batch = lines.slice(i, i + batchSize);
    await prisma.bankStatementLine.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    if (inserted % 10000 === 0) {
      console.log(`   ✅ Inserted ${inserted} bank statement lines...`);
    }
  }

  return { accounts: accountCount, lines: inserted };
}

async function main() {
  const targetRows = parseInt(process.env.SEED_TARGET_ROWS || "250000", 10);
  console.log(`🌱 High-Volume Seed Script`);
  console.log(`📊 Target: ~${targetRows.toLocaleString()} rows`);
  console.log("");

  try {
    await ensureTenant();
    console.log("✅ Tenant ensured");

    const finance = await seedFinance(Math.floor(targetRows * 0.4));
    const inventory = await seedInventory(Math.floor(targetRows * 0.25));
    const hr = await seedHR(Math.floor(targetRows * 0.15));
    const manufacturing = await seedManufacturing(Math.floor(targetRows * 0.1));
    const purchasing = await seedPurchasing(Math.floor(targetRows * 0.05));
    const banking = await seedBanking(Math.floor(targetRows * 0.05));

    const totalRows =
      finance.invoices +
      finance.bills +
      finance.journals +
      finance.payments +
      inventory.items +
      inventory.lots +
      hr.employees +
      hr.runs +
      hr.payslips +
      manufacturing.workOrders +
      purchasing.suppliers +
      purchasing.pos +
      banking.accounts +
      banking.lines;

    console.log("");
    console.log("✅ High-volume seed completed!");
    console.log(`📊 Total rows inserted: ${totalRows.toLocaleString()}`);
    console.log("");
    console.log("Breakdown:");
    console.log(`  Finance: ${finance.invoices + finance.bills + finance.journals + finance.payments} rows`);
    console.log(`  Inventory: ${inventory.items + inventory.lots} rows`);
    console.log(`  HR/Payroll: ${hr.employees + hr.runs + hr.payslips} rows`);
    console.log(`  Manufacturing: ${manufacturing.workOrders} rows`);
    console.log(`  Purchasing: ${purchasing.suppliers + purchasing.pos} rows`);
    console.log(`  Banking: ${banking.accounts + banking.lines} rows`);
  } catch (error: any) {
    console.error("❌ Error during seeding:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();

