/**
 * Depth Pass — Metrics Store Tests
 * Phase 5C: Tests for event handlers populating Fact tables
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { upsertFactInvoice, upsertFactReceipt, upsertFactInventoryMovement } from "@/server/metrics/store";

const prisma = new PrismaClient();
const TENANT_ID = "t-depth-pass-metrics-001";
const hasDb = Boolean(process.env.DATABASE_URL);

const t = hasDb ? test : test.skip;

beforeAll(async () => {
  if (!hasDb) return;
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: { id: TENANT_ID, name: "Depth Pass Metrics Test" },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

t("Invoice event populates FactInvoice", async () => {
  const customer = await prisma.customer.create({
    data: {
      tenantId: TENANT_ID,
      code: "CUST-METRICS-001",
      name: "Test Customer",
    },
  });

  await upsertFactInvoice(
    TENANT_ID,
    "inv-test-001",
    "INV-001",
    customer.id,
    1000,
    200,
    0,
    "GBP",
    "approved",
    new Date()
  );

  const factInvoice = await (prisma as any).factInvoice.findFirst({
    where: {
      tenantId: TENANT_ID,
      invoiceId: "inv-test-001",
    },
  });

  expect(factInvoice).toBeDefined();
  expect(Number(factInvoice.total)).toBe(1000);
  expect(Number(factInvoice.tax)).toBe(200);

  // Cleanup
  await (prisma as any).factInvoice.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.customer.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("POS sale event populates FactReceipt", async () => {
  const store = await prisma.store.create({
    data: {
      tenantId: TENANT_ID,
      code: "STORE-METRICS-001",
      name: "Test Store",
    },
  });

  await upsertFactReceipt(
    TENANT_ID,
    "sale-test-001",
    "SALE-001",
    null,
    store.id,
    1200,
    0,
    200,
    "GBP",
    "card",
    new Date()
  );

  const factReceipt = await (prisma as any).factReceipt.findFirst({
    where: {
      tenantId: TENANT_ID,
      receiptId: "sale-test-001",
    },
  });

  expect(factReceipt).toBeDefined();
  expect(Number(factReceipt.total)).toBe(1200);
  expect(Number(factReceipt.tax)).toBe(200);

  // Cleanup
  await (prisma as any).factReceipt.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.store.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Inventory movement event populates FactInventoryMovement", async () => {
  const warehouse = await prisma.warehouse.create({
    data: {
      tenantId: TENANT_ID,
      code: "WH-METRICS-001",
      name: "Test Warehouse",
    },
  });

  await upsertFactInventoryMovement(
    TENANT_ID,
    "move-test-001",
    "SKU-001",
    warehouse.id,
    null,
    10,
    100,
    1000,
    "grn",
    new Date()
  );

  const factMovement = await (prisma as any).factInventoryMovement.findFirst({
    where: {
      tenantId: TENANT_ID,
      movementId: "move-test-001",
    },
  });

  expect(factMovement).toBeDefined();
  expect(Number(factMovement.qty)).toBe(10);
  expect(Number(factMovement.totalCost)).toBe(1000);

  // Cleanup
  await (prisma as any).factInventoryMovement.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.warehouse.deleteMany({ where: { tenantId: TENANT_ID } });
});

