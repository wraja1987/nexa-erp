/**
 * Depth Pass — Manufacturing Material Issue Tests
 * Phase 5C: Tests for work order material issue
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { issueMaterialsToWorkOrder } from "@/server/manufacturing/material-issue";

const prisma = new PrismaClient();
const TENANT_ID = "t-depth-pass-mfg-001";
const hasDb = Boolean(process.env.DATABASE_URL);

const t = hasDb ? test : test.skip;

beforeAll(async () => {
  if (!hasDb) return;
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: { id: TENANT_ID, name: "Depth Pass Manufacturing Test" },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

t("Material issue reduces stock and creates StockMove", async () => {
  // Create inventory item
  const inventoryItem = await prisma.inventoryItem.create({
    data: {
      tenantId: TENANT_ID,
      sku: "SKU-MFG-001",
      qtyOnHand: 100 as any,
    },
  });

  // Create work order
  const workOrder = await prisma.workOrder.create({
    data: {
      tenantId: TENANT_ID,
      number: "WO-MFG-001",
      itemCode: "FG-001",
      quantity: 10 as any,
      status: "released",
    },
  });

  const qtyBefore = Number(inventoryItem.qtyOnHand);

  // Issue materials
  const materialIssues = await issueMaterialsToWorkOrder(
    { tenantId: TENANT_ID, entityId: null },
    workOrder.id,
    [
      {
        sku: "SKU-MFG-001",
        qty: 20,
        locationId: null,
        lotId: null,
      },
    ],
    "test-user-id"
  );

  expect(materialIssues.length).toBe(1);
  expect(materialIssues[0].sku).toBe("SKU-MFG-001");
  expect(Number(materialIssues[0].qty)).toBe(20);

  // Verify stock reduced
  const inventoryAfter = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItem.id },
  });
  expect(Number(inventoryAfter?.qtyOnHand || 0)).toBe(qtyBefore - 20);

  // Verify StockMove created
  const stockMove = await (prisma as any).stockMove.findFirst({
    where: {
      tenantId: TENANT_ID,
      sourceType: "work_order",
      sourceId: workOrder.id,
      type: "work_order_issue",
    },
  });
  expect(stockMove).toBeDefined();
  expect(stockMove.sku).toBe("SKU-MFG-001");
  expect(Number(stockMove.qty)).toBe(20);

  // Cleanup
  await (prisma as any).stockMove.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).workOrderMaterialIssue.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.workOrder.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.inventoryItem.deleteMany({ where: { tenantId: TENANT_ID } });
});

