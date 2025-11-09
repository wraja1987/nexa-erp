/*
  Phase 5 Seed — deterministic, idempotent demo data for focused flow tests
  Safe when DATABASE_URL is unset (skips). Uses a single dedicated tenant.
*/
/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim().length > 0);
}

const prisma = new PrismaClient();

const TENANT_ID = "t-phase5-demo-0001";

async function upsertTenant() {
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: { name: "Phase5 Demo" },
    create: { id: TENANT_ID, name: "Phase5 Demo" },
  });
}

async function seedFinance() {
  // Draft and Approved AR invoices
  const draft = await prisma.customerInvoice.upsert({
    where: { number: "INV-DRAFT-001" },
    update: { tenantId: TENANT_ID, status: "draft" },
    create: { id: "inv-draft-001", tenantId: TENANT_ID, number: "INV-DRAFT-001", customerId: "cust-demo", total: 1000 as any, status: "draft" },
  });
  const approved = await prisma.customerInvoice.upsert({
    where: { number: "INV-APPROVED-001" },
    update: { tenantId: TENANT_ID, status: "approved" },
    create: { id: "inv-approved-001", tenantId: TENANT_ID, number: "INV-APPROVED-001", customerId: "cust-demo", total: 2500 as any, status: "approved" },
  });
  return { draft, approved };
}

async function seedInventory() {
  // One low on-hand SKU
  const sku = "SKU-P5-001";
  const item = await prisma.inventoryItem.upsert({
    where: { id: "invitem-p5-001" },
    update: { qtyOnHand: 1 as any },
    create: { id: "invitem-p5-001", tenantId: TENANT_ID, sku, qtyOnHand: 1 as any },
  });
  return { item };
}

async function seedManufacturing() {
  // Work order that will fail component issue first (insufficient stock), then succeed after GRN.
  const wo = await prisma.workOrder.upsert({
    where: { number: "WO-P5-001" },
    update: { tenantId: TENANT_ID, itemCode: "FG-P5-001", quantity: 1 as any },
    create: { id: "wo-p5-001", tenantId: TENANT_ID, number: "WO-P5-001", itemCode: "FG-P5-001", quantity: 1 as any },
  });
  // BOM requires 2 units of SKU-P5-001
  await prisma.bomItem.upsert({
    where: { id: "bom-p5-001" },
    update: { tenantId: TENANT_ID, parentItemCode: "FG-P5-001", componentItemCode: "SKU-P5-001", quantity: 2 as any },
    create: { id: "bom-p5-001", tenantId: TENANT_ID, parentItemCode: "FG-P5-001", componentItemCode: "SKU-P5-001", quantity: 2 as any },
  });
  return { wo };
}

async function seedPOS() {
  // Minimal store and open sale ready to finalise
  const store = await prisma.store.upsert({
    where: { tenantId_code: { tenantId: TENANT_ID, code: "STORE-P5-001" } as any },
    update: { name: "Phase5 Store", tenantId: TENANT_ID },
    create: { id: "store-p5-001", tenantId: TENANT_ID, name: "Phase5 Store", code: "STORE-P5-001" },
  });
  const sale = await prisma.posSale.upsert({
    where: { tenantId_saleNumber: { tenantId: TENANT_ID, saleNumber: "SALE-P5-001" } as any },
    update: { tenantId: TENANT_ID, storeId: store.id, status: "open" },
    create: {
      id: "sale-p5-001",
      tenantId: TENANT_ID,
      storeId: store.id,
      cashierUserId: "cashier-demo",
      saleNumber: "SALE-P5-001",
      status: "open",
      subtotal: 1000 as any,
      tax: 200 as any,
      total: 1200 as any,
      currency: "GBP",
    },
  });
  return { store, sale };
}

async function main() {
  if (!hasDatabaseUrl()) {
    console.log("[phase5:seed] DATABASE_URL not set; skipping seed (ok)");
    return;
  }
  try {
    await upsertTenant();
    const finance = await seedFinance();
    const inventory = await seedInventory();
    const mfg = await seedManufacturing();
    const pos = await seedPOS();
    console.log("[phase5:seed] tenant:", TENANT_ID);
    console.log("[phase5:seed] invoices:", finance.draft.number, finance.approved.number);
    console.log("[phase5:seed] sku:", inventory.item.sku, "qtyOnHand:", String(inventory.item.qtyOnHand));
    console.log("[phase5:seed] work order:", mfg.wo.number);
    console.log("[phase5:seed] pos sale:", pos.sale.saleNumber);
  } catch (err) {
    console.error("[phase5:seed] error:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();


