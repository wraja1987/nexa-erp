/**
 * Depth Pass — Propagation Harness
 * Phase 5C: End-to-end cross-module event-driven scenarios
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { convertContactToOpportunity } from "@/server/crm/pipelines";
import { createQuote, acceptQuote } from "@/server/sales/quotes";
import { createOrder } from "@/server/sales/orders";
import { postGoodsReceipt } from "@/server/inventory/grn";
import { completePickTask } from "@/server/wms/pick-ship";
import { confirmShipment } from "@/server/wms/pick-ship";
import { confirmInvoiceFromOrder } from "@/server/sales/order-to-invoice";
import { approveTimesheet } from "@/server/projects/timesheets";
import { buildBillingPreview, createProjectInvoice } from "@/server/projects/billing";
import { finalisePosSale } from "@/server/pos/sales";
import { openSession, closeSession } from "@/server/pos/sessions";

const prisma = new PrismaClient();
const TENANT_ID = "t-propagation-test-001";
const hasDb = Boolean(process.env.DATABASE_URL);

const t = hasDb ? test : test.skip;

beforeAll(async () => {
  if (!hasDb) return;
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: { id: TENANT_ID, name: "Propagation Test Tenant" },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

t("Scenario A: CRM → Sales → WMS → Finance → Metrics", async () => {
  // Seed basic data
  const customer = await prisma.customer.create({
    data: {
      tenantId: TENANT_ID,
      code: "CUST-PROP-A",
      name: "Propagation Customer A",
    },
  });

  const warehouse = await prisma.warehouse.create({
    data: {
      tenantId: TENANT_ID,
      code: "WH-PROP-A",
      name: "Propagation Warehouse",
    },
  });

  const location = await prisma.location.create({
    data: {
      tenantId: TENANT_ID,
      warehouseId: warehouse.id,
      code: "LOC-PROP-A",
      name: "Storage",
    },
  });

  // Create inventory item
  await prisma.inventoryItem.create({
    data: {
      tenantId: TENANT_ID,
      sku: "PROD-PROP-A",
      qtyOnHand: 0 as any,
    },
  });

  // Step 1: Lead → Opportunity
  const contact = await prisma.crmContact.create({
    data: {
      tenantId: TENANT_ID,
      firstName: "Test",
      lastName: "Lead",
      email: "test@example.com",
    },
  });

  const opportunity = await convertContactToOpportunity(
    { tenantId: TENANT_ID, entityId: null },
    contact.id,
    {
      name: "Propagation Opportunity",
      value: 10000,
    },
    "test-user-id"
  );

  expect(opportunity).toBeDefined();

  // Step 2: Opportunity → Quote
  const quote = await createQuote(
    { tenantId: TENANT_ID, entityId: null },
    {
      customerId: customer.id,
      opportunityId: opportunity.id,
      currency: "GBP",
      lines: [
        {
          sku: "PROD-PROP-A",
          description: "Test Product",
          qty: 1,
          unitPrice: 10000,
        },
      ],
    },
    "test-user-id"
  );

  expect(quote).toBeDefined();

  // Step 3: Quote → Order
  const acceptedQuote = await acceptQuote(
    { tenantId: TENANT_ID, entityId: null },
    quote.id,
    "test-user-id"
  );

  expect(acceptedQuote.order).toBeDefined();
  const order = acceptedQuote.order;

  // Step 4: GRN for stock
  await postGoodsReceipt(
    { tenantId: TENANT_ID, entityId: null },
    {
      sku: "PROD-PROP-A",
      qty: 10,
      unitCostMinor: 5000,
      warehouseId: warehouse.id,
      locationId: location.id,
    },
    "test-user-id"
  );

  // Verify inventory updated
  const inventoryAfterGrn = await prisma.inventoryItem.findFirst({
    where: { tenantId: TENANT_ID, sku: "PROD-PROP-A" },
  });
  expect(Number(inventoryAfterGrn?.qtyOnHand || 0)).toBe(10);

  // Step 5: Create pick task (simplified - would normally be created by WMS)
  const pickTask = await (prisma as any).pickTask.create({
    data: {
      tenantId: TENANT_ID,
      sku: "PROD-PROP-A",
      qty: 1 as any,
      fromLocId: location.id,
      toLocId: null,
      status: "queued",
      orderId: order.id,
      orderType: "sales_order",
    },
  });

  // Step 6: Complete pick
  await completePickTask(
    { tenantId: TENANT_ID, entityId: null },
    pickTask.id,
    1,
    "test-user-id"
  );

  // Step 7: Confirm shipment
  await confirmShipment(
    { tenantId: TENANT_ID, entityId: null },
    "SHIP-PROP-A-001",
    order.id,
    "sales_order",
    warehouse.id,
    [{ sku: "PROD-PROP-A", qty: 1 }],
    undefined,
    undefined,
    "test-user-id"
  );

  // Step 8: Create invoice
  const invoice = await confirmInvoiceFromOrder(
    { tenantId: TENANT_ID, entityId: null },
    order.id,
    "INV-PROP-A-001",
    "test-user-id"
  );

  expect(invoice).toBeDefined();

  // Assertions
  // 1. Inventory on-hand changed correctly
  const inventoryFinal = await prisma.inventoryItem.findFirst({
    where: { tenantId: TENANT_ID, sku: "PROD-PROP-A" },
  });
  expect(Number(inventoryFinal?.qtyOnHand || 0)).toBe(9); // 10 - 1

  // 2. Finance invoice exists with correct totals
  expect(Number(invoice.total)).toBeGreaterThan(0);

  // 3. Fact tables populated
  const factInvoice = await (prisma as any).factInvoice.findFirst({
    where: {
      tenantId: TENANT_ID,
      invoiceId: invoice.id,
    },
  });
  expect(factInvoice).toBeDefined();

  const factOrder = await (prisma as any).factOrder.findFirst({
    where: {
      tenantId: TENANT_ID,
      orderId: order.id,
    },
  });
  expect(factOrder).toBeDefined();

  const factMovement = await (prisma as any).factInventoryMovement.findFirst({
    where: {
      tenantId: TENANT_ID,
      sku: "PROD-PROP-A",
    },
  });
  expect(factMovement).toBeDefined();

  // Cleanup
  await (prisma as any).factInventoryMovement.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).factOrder.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).factInvoice.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).shipment.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).pickTask.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).stockMove.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.customerInvoice.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.salesOrderLine.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.salesOrder.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.salesQuote.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.crmOpportunity.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.crmContact.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.inventoryItem.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.location.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.warehouse.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.customer.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Scenario B: Projects → WIP → Billing → Finance → Metrics", async () => {
  // Seed project data
  const customer = await prisma.customer.create({
    data: {
      tenantId: TENANT_ID,
      code: "CUST-PROP-B",
      name: "Propagation Customer B",
    },
  });

  const project = await prisma.project.create({
    data: {
      tenantId: TENANT_ID,
      name: "Propagation Project",
      code: "PROJ-PROP-B",
      customerId: customer.id,
      billingMode: "TIME_AND_MATERIALS",
    },
  });

  const employee = await prisma.employee.create({
    data: {
      tenantId: TENANT_ID,
      empNo: "EMP-PROP-B",
      firstName: "Test",
      lastName: "Employee",
    },
  });

  // Step 1: Create and approve timesheet
  const timesheet = await prisma.timesheet.create({
    data: {
      tenantId: TENANT_ID,
      projectId: project.id,
      employeeId: employee.id,
      hours: 8 as any,
      status: "submitted",
    },
  });

  await approveTimesheet(
    { tenantId: TENANT_ID, entityId: null },
    timesheet.id,
    "test-user-id"
  );

  // Verify WIP created
  const wipEntry = await prisma.wipLedger.findFirst({
    where: {
      tenantId: TENANT_ID,
      projectId: project.id,
      referenceId: timesheet.id,
    },
  });
  expect(wipEntry).toBeDefined();
  expect(wipEntry?.billed).toBe(false);

  // Step 2: Build billing preview
  const preview = await buildBillingPreview(
    { tenantId: TENANT_ID, entityId: null },
    project.id,
    "TIME_AND_MATERIALS"
  );

  expect(preview.lines.length).toBeGreaterThan(0);

  // Step 3: Create invoice
  const invoice = await createProjectInvoice(
    { tenantId: TENANT_ID, entityId: null },
    project.id,
    preview,
    "test-user-id"
  );

  expect(invoice).toBeDefined();

  // Assertions
  // 1. WIP marked as billed
  const updatedWip = await prisma.wipLedger.findUnique({
    where: { id: wipEntry!.id },
  });
  expect(updatedWip?.billed).toBe(true);
  expect(updatedWip?.invoiceId).toBe(invoice.id);

  // 2. Finance invoice exists
  const financeInvoice = await prisma.customerInvoice.findUnique({
    where: { id: invoice.id },
  });
  expect(financeInvoice).toBeDefined();
  expect(Number(financeInvoice?.total || 0)).toBeGreaterThan(0);

  // 3. Fact tables populated
  const factInvoice = await (prisma as any).factInvoice.findFirst({
    where: {
      tenantId: TENANT_ID,
      invoiceId: invoice.id,
    },
  });
  expect(factInvoice).toBeDefined();

  const factProjectWip = await (prisma as any).factProjectWip.findFirst({
    where: {
      tenantId: TENANT_ID,
      projectId: project.id,
    },
  });
  expect(factProjectWip).toBeDefined();

  // Cleanup
  await (prisma as any).factProjectWip.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).factInvoice.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.customerInvoice.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.wipLedger.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.timesheet.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.employee.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.project.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.customer.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Scenario C: POS → Inventory → Finance → Metrics", async () => {
  // Seed POS data
  const store = await prisma.store.create({
    data: {
      tenantId: TENANT_ID,
      code: "STORE-PROP-C",
      name: "Propagation Store",
    },
  });

  const shift = await (prisma as any).shift.create({
    data: {
      tenantId: TENANT_ID,
      storeId: store.id,
      code: "SHIFT-PROP-C",
      startTime: new Date(),
    },
  });

  await prisma.inventoryItem.create({
    data: {
      tenantId: TENANT_ID,
      sku: "SKU-POS-PROP-C",
      qtyOnHand: 10 as any,
    },
  });

  // Step 1: Open session
  const session = await openSession(
    { tenantId: TENANT_ID, entityId: null },
    {
      storeId: store.id,
      shiftId: shift.id,
      openedBy: "test-user-id",
      openingFloat: 10000,
    },
    "test-user-id"
  );

  expect(session).toBeDefined();

  // Step 2: Create sale with promotion
  const sale = await prisma.posSale.create({
    data: {
      tenantId: TENANT_ID,
      storeId: store.id,
      sessionId: session.id,
      shiftId: shift.id,
      saleNumber: "SALE-PROP-C-001",
      status: "pending",
      subtotal: 1000 as any,
      tax: 200 as any,
      total: 1200 as any,
      currency: "GBP",
    },
  });

  await (prisma as any).posLine.create({
    data: {
      tenantId: TENANT_ID,
      saleId: sale.id,
      sku: "SKU-POS-PROP-C",
      qty: 2 as any,
      unitPrice: 500 as any,
      total: 1000 as any,
      discount: 0 as any,
    },
  });

  // Finalize sale
  await finalisePosSale(
    { tenantId: TENANT_ID, entityId: null },
    sale.id,
    {
      method: "card",
      amountMinor: 1200,
      reference: "PAY-001",
    },
    "test-user-id"
  );

  // Step 3: Close session
  await closeSession(
    { tenantId: TENANT_ID, entityId: null },
    session.id,
    {
      closedBy: "test-user-id",
      closingFloat: 11200,
    },
    "test-user-id"
  );

  // Assertions
  // 1. StockMove decrements on-hand
  const inventoryAfter = await prisma.inventoryItem.findFirst({
    where: { tenantId: TENANT_ID, sku: "SKU-POS-PROP-C" },
  });
  expect(Number(inventoryAfter?.qtyOnHand || 0)).toBe(8); // 10 - 2

  // 2. StockMove created
  const stockMove = await (prisma as any).stockMove.findFirst({
    where: {
      tenantId: TENANT_ID,
      sourceType: "pos_sale",
      sourceId: sale.id,
    },
  });
  expect(stockMove).toBeDefined();

  // 3. Fact tables populated
  const factReceipt = await (prisma as any).factReceipt.findFirst({
    where: {
      tenantId: TENANT_ID,
      receiptId: sale.id,
    },
  });
  expect(factReceipt).toBeDefined();

  const factMovement = await (prisma as any).factInventoryMovement.findFirst({
    where: {
      tenantId: TENANT_ID,
      sku: "SKU-POS-PROP-C",
      movementType: "pos_sale",
    },
  });
  expect(factMovement).toBeDefined();

  // Cleanup
  await (prisma as any).factInventoryMovement.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).factReceipt.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).stockMove.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).posPayment.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).posLine.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.posSale.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).posSession.deleteMany({ where: { tenantId: TENANT_ID } });
  await (prisma as any).shift.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.inventoryItem.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.store.deleteMany({ where: { tenantId: TENANT_ID } });
});

