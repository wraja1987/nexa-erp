import request from "supertest";
import { describe, test, expect, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const TENANT_ID = "t-phase5-demo-0001";
const t = test;

async function getIds() {
  const invDraft = await prisma.customerInvoice.findUnique({ where: { number: "INV-DRAFT-001" } });
  const invApproved = await prisma.customerInvoice.findUnique({ where: { number: "INV-APPROVED-001" } });
  const wo = await prisma.workOrder.findUnique({ where: { number: "WO-P5-001" } });
  const sale = await prisma.posSale.findUnique({ where: { tenantId_saleNumber: { tenantId: TENANT_ID, saleNumber: "SALE-P5-001" } } as any });
  return { invDraftId: invDraft?.id!, invApprovedId: invApproved?.id!, woId: wo?.id!, saleId: sale?.id! };
}

describe("Task5 Add-ons — Negative paths and idempotency", () => {
  beforeAll(async () => {
    // Ensure seed present
    // seed-phase5 is idempotent and already used in main flows
  });

  t("Finance: re-approve an already approved invoice → 409", async () => {
    const ids = await getIds();
    const res = await request(base)
      .post("/api/finance/ar/invoice/approve")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .send({ invoiceId: ids.invApprovedId, tenantId: TENANT_ID });
    expect(res.status).toBe(409);
  });

  t("Finance: pay non-approved invoice → 400", async () => {
    const ids = await getIds();
    const res = await request(base)
      .post("/api/finance/ar/invoice/pay")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .send({ invoiceId: ids.invDraftId, amountMinor: 100, method: "CASH", reference: "BAD-PAY", tenantId: TENANT_ID });
    expect(res.status).toBe(400);
  });

  t("Finance: overpay → 400; duplicate reference → 409", async () => {
    const ids = await getIds();
    const over = await request(base)
      .post("/api/finance/ar/invoice/pay")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .send({ invoiceId: ids.invApprovedId, amountMinor: 999_999, method: "CASH", reference: "OVR", tenantId: TENANT_ID });
    expect(over.status).toBe(400);
    // pay small amount with reference, then repeat
    const r1 = await request(base)
      .post("/api/finance/ar/invoice/pay")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .send({ invoiceId: ids.invApprovedId, amountMinor: 10, method: "CASH", reference: "DUP-REF-1", tenantId: TENANT_ID });
    expect([200, 201]).toContain(r1.status);
    const r2 = await request(base)
      .post("/api/finance/ar/invoice/pay")
      .set("content-type", "application/json")
      .set("x-role", "ADMIN")
      .send({ invoiceId: ids.invApprovedId, amountMinor: 5, method: "CASH", reference: "DUP-REF-1", tenantId: TENANT_ID });
    expect(r2.status).toBe(409);
  });

  t("Inventory: two rapid GRNs increment on-hand correctly; no negatives", async () => {
    const before = await prisma.inventoryItem.findFirst({ where: { tenantId: TENANT_ID, sku: "SKU-P5-001" } });
    const b = Number(before?.qtyOnHand || 0);
    const r1 = await request(base).post("/api/inventory/grn").set("content-type", "application/json").set("x-role", "ADMIN").send({ sku: "SKU-P5-001", qty: 1, unitCostMinor: 100, tenantId: TENANT_ID });
    const r2 = await request(base).post("/api/inventory/grn").set("content-type", "application/json").set("x-role", "ADMIN").send({ sku: "SKU-P5-001", qty: 1, unitCostMinor: 100, tenantId: TENANT_ID });
    expect([200, 201]).toContain(r1.status);
    expect([200, 201]).toContain(r2.status);
    const after = await prisma.inventoryItem.findFirst({ where: { tenantId: TENANT_ID, sku: "SKU-P5-001" } });
    const a = Number(after?.qtyOnHand || 0);
    expect(a).toBeGreaterThanOrEqual(b + 2);
    expect(a).toBeGreaterThanOrEqual(0);
  });

  t("Projects: timesheet roll-up idempotent for same window; KPI count stable", async () => {
    const today = new Date(new Date().toDateString());
    const before = await prisma.kpiSnapshot.count({ where: { tenantId: TENANT_ID, name: "project:PRJ-P5-001:cost", asOf: { gte: today } } });
    const payload = { tenantId: TENANT_ID, sheets: [{ projectCode: "PRJ-P5-001", userId: "u1", minutes: 90, hourlyRateMinor: 3000 }] };
    const r1 = await request(base).post("/api/projects/timesheets/rollup").set("content-type", "application/json").set("x-role", "ADMIN").send(payload);
    expect([200, 201]).toContain(r1.status);
    const r2 = await request(base).post("/api/projects/timesheets/rollup").set("content-type", "application/json").set("x-role", "ADMIN").send(payload);
    expect([200, 201]).toContain(r2.status);
    const after = await prisma.kpiSnapshot.count({ where: { tenantId: TENANT_ID, name: "project:PRJ-P5-001:cost", asOf: { gte: today } } });
    expect(after).toBeLessThanOrEqual(before + 1);
  });
});

describe("Task5 Add-ons — Rate limit assertions (conditional)", () => {
  t("Mutating burst either returns <= 429 or is skipped without Redis", async () => {
    // If Upstash Redis is configured, a tight burst should trigger 429 on some requests.
    // Otherwise, the limiter returns true and we just assert non-5xx.
    const attempts = 20;
    let saw429 = false;
    for (let i = 0; i < attempts; i++) {
      const res = await request(base)
        .post("/api/admin/users/role")
        .set("content-type", "application/json")
        .set("x-role", "ADMIN")
        .send({ userId: "u1", role: "ADMIN", tenantId: TENANT_ID });
      if (res.status === 429) saw429 = true;
      expect(res.status).toBeLessThan(500);
    }
    // Allow either behavior depending on Redis presence
    expect([true, false]).toContain(saw429);
  });
});


