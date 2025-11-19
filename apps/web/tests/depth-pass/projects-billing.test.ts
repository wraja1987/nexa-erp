/**
 * Depth Pass — Projects/PSA Tests
 * Phase 5C: Tests for timesheet approval, WIP posting, billing
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { approveTimesheet } from "@/server/projects/timesheets";
import { buildBillingPreview, createProjectInvoice } from "@/server/projects/billing";
import { getEmployeeBillingRate } from "@/server/projects/rates";

const prisma = new PrismaClient();
const TENANT_ID = "t-depth-pass-projects-001";
const hasDb = Boolean(process.env.DATABASE_URL);

const t = hasDb ? test : test.skip;

beforeAll(async () => {
  if (!hasDb) return;
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: { id: TENANT_ID, name: "Depth Pass Projects Test" },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

t("Timesheet approval posts to WipLedger", async () => {
  // Create project, employee, timesheet
  const project = await prisma.project.create({
    data: {
      tenantId: TENANT_ID,
      name: "Test Project",
      code: "PROJ-001",
      customerId: "cust-test",
      billingMode: "TIME_AND_MATERIALS",
    },
  });

  const employee = await prisma.employee.create({
    data: {
      tenantId: TENANT_ID,
      empNo: "EMP-001",
      firstName: "Test",
      lastName: "Employee",
    },
  });

  const timesheet = await prisma.timesheet.create({
    data: {
      tenantId: TENANT_ID,
      projectId: project.id,
      employeeId: employee.id,
      hours: 8 as any,
      status: "submitted",
    },
  });

  // Approve timesheet
  await approveTimesheet(
    { tenantId: TENANT_ID, entityId: null },
    timesheet.id,
    "test-user-id"
  );

  // Verify WIP ledger entry created
  const wipEntry = await prisma.wipLedger.findFirst({
    where: {
      tenantId: TENANT_ID,
      projectId: project.id,
      referenceId: timesheet.id,
    },
  });

  expect(wipEntry).toBeDefined();
  expect(wipEntry?.type).toBe("timesheet");
  expect(Number(wipEntry?.amount || 0)).toBeGreaterThan(0); // Should use employee rate

  // Cleanup
  await prisma.wipLedger.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.timesheet.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.employee.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.project.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Billing preview picks up WIP correctly", async () => {
  // Create project with WIP
  const project = await prisma.project.create({
    data: {
      tenantId: TENANT_ID,
      name: "Test Project",
      code: "PROJ-002",
      customerId: "cust-test",
      billingMode: "TIME_AND_MATERIALS",
    },
  });

  // Create WIP entry
  await prisma.wipLedger.create({
    data: {
      tenantId: TENANT_ID,
      projectId: project.id,
      type: "timesheet",
      amount: 1000 as any,
      currency: "GBP",
      billed: false,
      postedAt: new Date(),
    },
  });

  // Build billing preview
  const preview = await buildBillingPreview(
    { tenantId: TENANT_ID, entityId: null },
    project.id,
    "TIME_AND_MATERIALS"
  );

  expect(preview).toBeDefined();
  expect(preview.lines.length).toBeGreaterThan(0);
  expect(preview.total).toBeGreaterThan(0);

  // Cleanup
  await prisma.wipLedger.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.project.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Project invoice creation marks WIP as billed", async () => {
  // Create project with WIP
  const project = await prisma.project.create({
    data: {
      tenantId: TENANT_ID,
      name: "Test Project",
      code: "PROJ-003",
      customerId: "cust-test",
      billingMode: "TIME_AND_MATERIALS",
    },
  });

  const wipEntry = await prisma.wipLedger.create({
    data: {
      tenantId: TENANT_ID,
      projectId: project.id,
      type: "timesheet",
      amount: 1000 as any,
      currency: "GBP",
      billed: false,
      postedAt: new Date(),
    },
  });

  // Build preview and create invoice
  const preview = await buildBillingPreview(
    { tenantId: TENANT_ID, entityId: null },
    project.id,
    "TIME_AND_MATERIALS"
  );

  const invoice = await createProjectInvoice(
    { tenantId: TENANT_ID, entityId: null },
    project.id,
    preview,
    "test-user-id"
  );

  expect(invoice).toBeDefined();

  // Verify WIP marked as billed
  const updatedWip = await prisma.wipLedger.findUnique({
    where: { id: wipEntry.id },
  });

  expect(updatedWip?.billed).toBe(true);
  expect(updatedWip?.invoiceId).toBe(invoice.id);

  // Cleanup
  await prisma.customerInvoice.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.wipLedger.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.project.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Employee billing rate service", async () => {
  const employee = await prisma.employee.create({
    data: {
      tenantId: TENANT_ID,
      empNo: "EMP-RATE-001",
      firstName: "Test",
      lastName: "Employee",
    },
  });

  const rate = await getEmployeeBillingRate(TENANT_ID, employee.id);
  expect(rate).toBeGreaterThan(0); // Should return default rate

  // Cleanup
  await prisma.employee.deleteMany({ where: { tenantId: TENANT_ID } });
});

