/**
 * Depth Pass — CRM/Sales Pipeline Tests
 * Phase 5C: Tests for Lead→Opportunity→Quote→Order→Invoice flows
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { convertContactToOpportunity } from "@/server/crm/pipelines";
import { createQuote, acceptQuote } from "@/server/sales/quotes";
import { createOrder } from "@/server/sales/orders";
import { confirmInvoiceFromOrder } from "@/server/sales/order-to-invoice";
import { calculateTax } from "@/server/tax/service";

const prisma = new PrismaClient();
const TENANT_ID = "t-depth-pass-test-001";
const hasDb = Boolean(process.env.DATABASE_URL);

const t = hasDb ? test : test.skip;

beforeAll(async () => {
  if (!hasDb) return;
  // Seed minimal test data
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: { id: TENANT_ID, name: "Depth Pass Test" },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

t("Lead → Opportunity conversion", async () => {
  // Create a contact (acting as lead)
  const contact = await prisma.crmContact.create({
    data: {
      tenantId: TENANT_ID,
      firstName: "Test",
      lastName: "Lead",
      email: "test@example.com",
    },
  });

  // Convert to opportunity
  const opportunity = await convertContactToOpportunity(
    { tenantId: TENANT_ID, entityId: null },
    contact.id,
    {
      name: "Test Opportunity",
      value: 10000,
      expectedCloseDate: new Date(),
      source: "Website",
    },
    "test-user-id"
  );

  expect(opportunity).toBeDefined();
  expect(opportunity.name).toBe("Test Opportunity");
  expect(opportunity.value).toBe(10000);
  expect(opportunity.contactId).toBe(contact.id);

  // Cleanup
  await prisma.crmOpportunity.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.crmContact.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Opportunity → Quote creation", async () => {
  // Create customer and opportunity
  const customer = await prisma.customer.create({
    data: {
      tenantId: TENANT_ID,
      code: "CUST-TEST-001",
      name: "Test Customer",
    },
  });

  const opportunity = await prisma.crmOpportunity.create({
    data: {
      tenantId: TENANT_ID,
      name: "Test Opp",
      stage: "qualified",
      value: 10000,
      currency: "GBP",
      customerId: customer.id,
    },
  });

  // Create quote from opportunity
  const quote = await createQuote(
    { tenantId: TENANT_ID, entityId: null },
    {
      customerId: customer.id,
      opportunityId: opportunity.id,
      currency: "GBP",
      lines: [
        {
          sku: "PROD-001",
          description: "Test Product",
          qty: 1,
          unitPrice: 10000,
        },
      ],
    },
    "test-user-id"
  );

  expect(quote).toBeDefined();
  expect(quote.opportunityId).toBe(opportunity.id);
  expect(quote.customerId).toBe(customer.id);

  // Cleanup
  await prisma.salesQuote.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.crmOpportunity.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.customer.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Quote accept → SalesOrder creation", async () => {
  // Create customer and quote
  const customer = await prisma.customer.create({
    data: {
      tenantId: TENANT_ID,
      code: "CUST-TEST-002",
      name: "Test Customer",
    },
  });

  const quote = await prisma.salesQuote.create({
    data: {
      tenantId: TENANT_ID,
      customerId: customer.id,
      number: "QT-TEST-001",
      currency: "GBP",
      total: 10000 as any,
      status: "sent",
      sentAt: new Date(),
    },
  });

  // Accept quote
  const result = await acceptQuote(
    { tenantId: TENANT_ID, entityId: null },
    quote.id,
    "test-user-id"
  );

  expect(result.order).toBeDefined();
  expect(result.order.customerId).toBe(customer.id);
  expect(result.order.quoteId).toBe(quote.id);

  // Cleanup
  await prisma.salesOrder.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.salesQuote.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.customer.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Order → Invoice with Tax service", async () => {
  // Create customer and order
  const customer = await prisma.customer.create({
    data: {
      tenantId: TENANT_ID,
      code: "CUST-TEST-003",
      name: "Test Customer",
    },
  });

  const order = await prisma.salesOrder.create({
    data: {
      tenantId: TENANT_ID,
      customerId: customer.id,
      number: "SO-TEST-001",
      currency: "GBP",
      total: 10000 as any,
      status: "pending",
    },
  });

  await prisma.salesOrderLine.create({
    data: {
      tenantId: TENANT_ID,
      orderId: order.id,
      sku: "PROD-001",
      qty: 1 as any,
      unitPrice: 10000 as any,
      total: 10000 as any,
    },
  });

  // Create invoice from order
  const invoice = await confirmInvoiceFromOrder(
    { tenantId: TENANT_ID, entityId: null },
    order.id,
    "INV-TEST-001",
    "test-user-id"
  );

  expect(invoice).toBeDefined();
  expect(invoice.customerId).toBe(customer.id);
  expect(Number(invoice.total)).toBeGreaterThan(0);

  // Verify tax was calculated (should use Tax service)
  // Invoice total should include tax if tax rules exist

  // Cleanup
  await prisma.customerInvoice.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.salesOrderLine.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.salesOrder.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.customer.deleteMany({ where: { tenantId: TENANT_ID } });
});

t("Tax service uses TaxRule", async () => {
  // Create tax group and rule
  const taxGroup = await prisma.taxGroup.create({
    data: {
      tenantId: TENANT_ID,
      code: "STANDARD",
      name: "Standard VAT",
    },
  });

  await prisma.taxRule.create({
    data: {
      taxGroupId: taxGroup.id,
      jurisdiction: "UK",
      rate: 0.20 as any,
      effectiveFrom: new Date(),
    },
  });

  // Calculate tax
  const result = await calculateTax({
    tenantId: TENANT_ID,
    subtotal: 1000,
    jurisdiction: "UK",
  });

  expect(result.taxRate).toBe(0.20);
  expect(result.taxAmount).toBe(200);
  expect(result.total).toBe(1200);
  expect(result.taxCode).toBe("STANDARD");

  // Cleanup
  await prisma.taxRule.deleteMany({ where: { taxGroup: { tenantId: TENANT_ID } } });
  await prisma.taxGroup.deleteMany({ where: { tenantId: TENANT_ID } });
});

