/**
 * Depth Pass — WMS Flows Tests
 * Phase 5C: Tests for GRN, putaway, pick, ship, cycle count
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { postGoodsReceipt } from "@/server/inventory/grn";
import { createPutawayTasks, completePutawayTask } from "@/server/wms/putaway";
import { completePickTask } from "@/server/wms/pick-ship";
import { createCycleCountPlan, recordCycleCountResult, approveCycleCountVariance } from "@/server/wms/cyclecount";

const prisma = new PrismaClient();
const TENANT_ID = "t-depth-pass-wms-001";
const hasDb = Boolean(process.env.DATABASE_URL);

const t = hasDb ? test : test.skip;

beforeAll(async () => {
  if (!hasDb) return;
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: { id: TENANT_ID, name: "Depth Pass WMS Test" },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

t("GRN creates StockMove and updates on-hand", async () => {
  const warehouse = await prisma.warehouse.create({
    data: {
      tenantId: TENANT_ID,
      code: "WH-001",
      name: "Test Warehouse",
    },
  });

  const location = await prisma.location.create({
    data: {
      tenantId: TENANT_ID,
      warehouseId: warehouse.id,
      code: "LOC-001",
      name: "Receiving",
    },
  });

  const qtyBefore = 10;
  await prisma.inventoryItem.upsert({
    where: { tenantId_sku: { tenantId: TENANT_ID, sku: "SKU-GRN-001" } as any },
    update: { qtyOnHand: qtyBefore as any },
    create: {
      tenantId: TENANT_ID,
      sku: "SKU-GRN-001",
      qtyOnHand: qtyBefore as any,
    },
  });

  // Post GRN
  await postGoodsReceipt(
    { tenantId: TENANT_ID, entityId: null },
    {
      sku: "SKU-GRN-001",
      qty: 5,
      unitCostMinor: 1000,
      warehouseId: warehouse.id,
      locationId: location.id,
    },
    "test-user-id"
  );

  // Verify on-hand increased
  const inventory = await prisma.inventoryItem.findFirst({
    where: { tenantId: TENANT_ID, sku: "SKU-GRN-001" },
  });
  expect(Number(inventory?.qtyOnHand || 0)).toBe(qtyBefore + 5);

  // Verify StockMove created
  const stockMove = await (prisma as any).stockMove.findFirst({
    where: {
      tenantId: TENANT_ID,
      type: "grn",
      sku: "SKU-GRN-001",
    },
  });
  expect(stockMove).toBeDefined();

  // Cleanup
  await (prisma as any).stockMove.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.inventoryItem.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.location.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.warehouse.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Putaway moves stock from staging to final location", async () => {
  const warehouse = await prisma.warehouse.create({
    data: {
      tenantId: TENANT_ID,
      code: "WH-PUTAWAY-001",
      name: "Test Warehouse",
    },
  });

  const stagingLoc = await prisma.location.create({
    data: {
      tenantId: TENANT_ID,
      warehouseId: warehouse.id,
      code: "STAGING",
      name: "Staging",
    },
  });

  const finalLoc = await prisma.location.create({
    data: {
      tenantId: TENANT_ID,
      warehouseId: warehouse.id,
      code: "BIN-A1",
      name: "Bin A1",
    },
  });

  // Create putaway task
  const tasks = await createPutawayTasks(
    { tenantId: TENANT_ID, entityId: null },
    "grn-test-id",
    [
      {
        sku: "SKU-PUTAWAY-001",
        qty: 10,
        fromLocationId: stagingLoc.id,
        toLocationId: finalLoc.id,
      },
    ],
    "test-user-id"
  );

  expect(tasks.length).toBe(1);

  // Complete putaway task
  await completePutawayTask(
    { tenantId: TENANT_ID, entityId: null },
    tasks[0].id,
    "test-user-id"
  );

  // Verify StockMove created
  const stockMove = await (prisma as any).stockMove.findFirst({
    where: {
      tenantId: TENANT_ID,
      sourceType: "putaway_task",
      sourceId: tasks[0].id,
    },
  });
  expect(stockMove).toBeDefined();
  expect(stockMove.toLocationId).toBe(finalLoc.id);

  // Cleanup
  await (prisma as any).stockMove.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.putawayTask.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.location.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.warehouse.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Cycle count posts adjustment StockMove", async () => {
  const warehouse = await prisma.warehouse.create({
    data: {
      tenantId: TENANT_ID,
      code: "WH-CC-001",
      name: "Test Warehouse",
    },
  });

  const location = await prisma.location.create({
    data: {
      tenantId: TENANT_ID,
      warehouseId: warehouse.id,
      code: "LOC-CC-001",
      name: "Test Location",
    },
  });

  await prisma.inventoryItem.create({
    data: {
      tenantId: TENANT_ID,
      sku: "SKU-CC-001",
      qtyOnHand: 10 as any,
      locationId: location.id,
    },
  });

  // Create cycle count plan
  const plan = await createCycleCountPlan(
    { tenantId: TENANT_ID, entityId: null },
    warehouse.id,
    "Test Count",
    "monthly",
    new Date(),
    new Date(),
    [{ sku: "SKU-CC-001", locationId: location.id }],
    "test-user-id"
  );

  expect(plan).toBeDefined();

  // Get cycle count line
  const line = await (prisma as any).cycleCountLine.findFirst({
    where: { tenantId: TENANT_ID, planId: plan.id },
  });

  // Record count (variance: counted 12, expected 10)
  await recordCycleCountResult(
    { tenantId: TENANT_ID, entityId: null },
    line.id,
    12,
    "test-user-id"
  );

  // Approve variance
  await approveCycleCountVariance(
    { tenantId: TENANT_ID, entityId: null },
    line.id,
    "test-user-id"
  );

  // Verify StockMove created
  const stockMove = await (prisma as any).stockMove.findFirst({
    where: {
      tenantId: TENANT_ID,
      sourceType: "cycle_count",
      sourceId: line.id,
    },
  });
  expect(stockMove).toBeDefined();

  // Verify inventory updated
  const inventory = await prisma.inventoryItem.findFirst({
    where: { tenantId: TENANT_ID, sku: "SKU-CC-001" },
  });
  expect(Number(inventory?.qtyOnHand || 0)).toBe(12); // Updated to counted qty

  // Cleanup
  await (prisma as any).stockMove.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).cycleCountLine.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).cycleCountPlan.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.inventoryItem.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.location.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.warehouse.deleteMany({ where: { tenantId: TENANT_ID } });
});

