import request from "supertest";
import { describe, test, expect, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const hasDb = Boolean(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim().length > 0);
const t = hasDb ? test : test.skip;

const TENANT_ID = "t-phase5-demo-0001";

async function ensurePhase5Seed() {
  // Minimal in-test upserts mirroring scripts/seeds/seed-phase5.ts (schema read-only)
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: { name: "Phase5 Demo" },
    create: { id: TENANT_ID, name: "Phase5 Demo" },
  });
  await prisma.customerInvoice.upsert({
    where: { number: "INV-DRAFT-001" },
    update: { tenantId: TENANT_ID, status: "draft" },
    create: { id: "inv-draft-001", tenantId: TENANT_ID, number: "INV-DRAFT-001", customerId: "cust-demo", total: 1000 as any, status: "draft" },
  });
  await prisma.customerInvoice.upsert({
    where: { number: "INV-APPROVED-001" },
    update: { tenantId: TENANT_ID, status: "approved" },
    create: { id: "inv-approved-001", tenantId: TENANT_ID, number: "INV-APPROVED-001", customerId: "cust-demo", total: 2500 as any, status: "approved" },
  });
  {
    const existing = await prisma.inventoryItem.findFirst({ where: { tenantId: TENANT_ID, sku: "SKU-P5-001" } });
    if (existing) {
      await prisma.inventoryItem.update({ where: { id: existing.id }, data: { qtyOnHand: 1 as any } });
    } else {
      await prisma.inventoryItem.create({ data: { id: "invitem-p5-001", tenantId: TENANT_ID, sku: "SKU-P5-001", qtyOnHand: 1 as any } });
    }
  }
  await prisma.workOrder.upsert({
    where: { number: "WO-P5-001" },
    update: { tenantId: TENANT_ID, itemCode: "FG-P5-001", quantity: 1 as any },
    create: { id: "wo-p5-001", tenantId: TENANT_ID, number: "WO-P5-001", itemCode: "FG-P5-001", quantity: 1 as any },
  });
  await prisma.bomItem.upsert({
    where: { id: "bom-p5-001" },
    update: { tenantId: TENANT_ID, parentItemCode: "FG-P5-001", componentItemCode: "SKU-P5-001", quantity: 2 as any },
    create: { id: "bom-p5-001", tenantId: TENANT_ID, parentItemCode: "FG-P5-001", componentItemCode: "SKU-P5-001", quantity: 2 as any },
  });
  const store = await prisma.store.upsert({
    where: { tenantId_code: { tenantId: TENANT_ID, code: "STORE-P5-001" } as any },
    update: { name: "Phase5 Store", tenantId: TENANT_ID },
    create: { id: "store-p5-001", tenantId: TENANT_ID, name: "Phase5 Store", code: "STORE-P5-001" },
  });
  await prisma.posSale.upsert({
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
}

describe("Phase 5 focused business flows (API)", () => {
  beforeAll(async () => {
    if (!hasDb) return;
    await ensurePhase5Seed();
  });

  t("Finance: approve draft invoice → status approved", async () => {
    const inv = await prisma.customerInvoice.findUnique({ where: { number: "INV-DRAFT-001" } });
    expect(inv).toBeTruthy();
    const res = await request(base)
      .post("/api/finance/ar/invoice/approve")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .send({ invoiceId: inv!.id, tenantId: TENANT_ID });
    expect([200, 201]).toContain(res.status);
    expect(res.body?.ok).toBe(true);
    const updated = await prisma.customerInvoice.findUnique({ where: { id: inv!.id } });
    expect(updated?.status).toBe("approved");
  });

  t("Finance: pay approved invoice in full → status paid", async () => {
    const inv = await prisma.customerInvoice.findUnique({ where: { number: "INV-APPROVED-001" } });
    expect(inv).toBeTruthy();
    const res = await request(base)
      .post("/api/finance/ar/invoice/pay")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .set("idempotency-key", `test-pay:${TENANT_ID}:${inv!.id}`)
      .send({ invoiceId: inv!.id, amountMinor: Number(inv!.total), method: "CASH", reference: "PHASE5-FULL", tenantId: TENANT_ID });
    expect([200, 201]).toContain(res.status);
    expect(res.body?.ok).toBe(true);
    const updated = await prisma.customerInvoice.findUnique({ where: { id: inv!.id } });
    expect(updated?.status).toBe("paid");
  });

  t("Inventory/MFG: GRN then consume BOM on WO", async () => {
    const grn = await request(base)
      .post("/api/inventory/grn")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .send({ sku: "SKU-P5-001", qty: 2, unitCostMinor: 100, tenantId: TENANT_ID });
    expect([200, 201]).toContain(grn.status);
    expect(grn.body?.ok).toBe(true);

    const wo = await prisma.workOrder.findUnique({ where: { number: "WO-P5-001" } });
    expect(wo).toBeTruthy();
    const mfg = await request(base)
      .post("/api/manufacturing/workorder/consume-bom")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .send({ workOrderId: wo!.id, tenantId: TENANT_ID });
    expect([200, 201]).toContain(mfg.status);
    expect(mfg.body?.ok).toBe(true);
  });

  t("POS: finalise sale idempotently", async () => {
    const sale = await prisma.posSale.findUnique({ where: { tenantId_saleNumber: { tenantId: TENANT_ID, saleNumber: "SALE-P5-001" } as any } });
    expect(sale).toBeTruthy();
    const idk = `pos-finalise:${TENANT_ID}:${sale!.id}:test`;
    const res1 = await request(base)
      .post("/api/pos/sale/finalise")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .set("idempotency-key", idk)
      .send({ saleId: sale!.id, tenantId: TENANT_ID });
    expect([200, 201]).toContain(res1.status);
    const res2 = await request(base)
      .post("/api/pos/sale/finalise")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .set("idempotency-key", idk)
      .send({ saleId: sale!.id, tenantId: TENANT_ID });
    expect([200, 201]).toContain(res2.status);
  });

  t("Projects: roll up timesheets into KPI snapshot", async () => {
    const res = await request(base)
      .post("/api/projects/timesheets/rollup")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .send({ tenantId: TENANT_ID, sheets: [{ projectCode: "PRJ-P5-001", userId: "u1", minutes: 90, hourlyRateMinor: 3000 }] });
    expect([200, 201]).toContain(res.status);
    expect(res.body?.ok).toBe(true);
    const today = new Date(new Date().toDateString());
    const snap = await prisma.kpiSnapshot.findFirst({ where: { tenantId: TENANT_ID, name: "project:PRJ-P5-001:cost", asOf: { gte: today } } });
    expect(snap).toBeTruthy();
    expect(Number(snap!.value)).toBeGreaterThan(0);
  });
});


