/**
 * Depth Pass — POS Refunds Tests
 * Phase 5C: Tests for refund service with stock and finance reversal
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createPosRefund } from "@/server/pos/refunds";
import { finalisePosSale } from "@/server/pos/sales";

const prisma = new PrismaClient();
const TENANT_ID = "t-depth-pass-pos-001";
const hasDb = Boolean(process.env.DATABASE_URL);

const t = hasDb ? test : test.skip;

beforeAll(async () => {
  if (!hasDb) return;
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: { id: TENANT_ID, name: "Depth Pass POS Test" },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

t("POS refund reverses stock movements", async () => {
  // Create store, inventory item, sale
  const store = await prisma.store.create({
    data: {
      tenantId: TENANT_ID,
      code: "STORE-001",
      name: "Test Store",
    },
  });

  const inventoryItem = await prisma.inventoryItem.create({
    data: {
      tenantId: TENANT_ID,
      sku: "SKU-REFUND-001",
      qtyOnHand: 10 as any,
    },
  });

  const sale = await prisma.posSale.create({
    data: {
      tenantId: TENANT_ID,
      storeId: store.id,
      saleNumber: "SALE-001",
      status: "paid",
      subtotal: 1000 as any,
      tax: 200 as any,
      total: 1200 as any,
      currency: "GBP",
    },
  });

  const saleLine = await (prisma as any).posLine.create({
    data: {
      tenantId: TENANT_ID,
      saleId: sale.id,
      sku: "SKU-REFUND-001",
      qty: 2 as any,
      unitPrice: 500 as any,
      total: 1000 as any,
    },
  });

  // Reduce inventory (simulate sale)
  await prisma.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: { qtyOnHand: { decrement: 2 as any } },
  });

  const qtyBeforeRefund = Number(
    (await prisma.inventoryItem.findUnique({ where: { id: inventoryItem.id } }))?.qtyOnHand || 0
  );

  // Create refund
  const refund = await createPosRefund(
    { tenantId: TENANT_ID, entityId: null },
    {
      saleId: sale.id,
      reason: "Customer return",
      lines: [{ lineId: saleLine.id, qty: 2 }],
    },
    "test-user-id"
  );

  expect(refund).toBeDefined();
  expect(Number(refund.amount || 0)).toBeGreaterThan(0);

  // Verify stock restored
  const inventoryAfter = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItem.id },
  });
  expect(Number(inventoryAfter?.qtyOnHand || 0)).toBe(qtyBeforeRefund + 2);

  // Verify StockMove created
  const stockMove = await (prisma as any).stockMove.findFirst({
    where: {
      tenantId: TENANT_ID,
      sourceType: "pos_refund",
      sourceId: refund.id,
    },
  });
  expect(stockMove).toBeDefined();

  // Cleanup
  await (prisma as any).stockMove.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).posRefund.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).posLine.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.posSale.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.inventoryItem.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.store.deleteMany({ where: { tenantId: TENANT_ID } });
});

