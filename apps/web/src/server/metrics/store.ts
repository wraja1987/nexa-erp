/**
 * Phase 4F — Metrics Store Wiring
 * Depth Pass: Event-driven fact/dimension table population
 */

import { prisma } from "@/lib/prisma";

/**
 * Ensure DimDate record exists for a given date
 */
export async function ensureDimDate(date: Date): Promise<string> {
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  const month = date.getMonth() + 1;
  const week = getWeekNumber(date);
  const day = date.getDate();
  const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Monday = 1
  const isWeekend = dayOfWeek >= 6;

  const existing = await prisma.dimDate.findUnique({
    where: { date: date },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.dimDate.create({
    data: {
      date,
      year,
      quarter,
      month,
      week,
      day,
      dayOfWeek,
      isWeekend,
      isHoliday: false, // Could be enhanced with holiday calendar
      fiscalYear: year, // Simplified - could use fiscal calendar
      fiscalQuarter: quarter,
    },
  });

  return created.id;
}

/**
 * Ensure DimTenant record exists
 */
export async function ensureDimTenant(tenantId: string): Promise<string> {
  const existing = await prisma.dimTenant.findUnique({
    where: { tenantId },
  });

  if (existing) {
    return existing.id;
  }

  // Load tenant details
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true },
  });

  const created = await prisma.dimTenant.create({
    data: {
      tenantId,
      name: tenant?.name || tenantId,
      region: null, // Could be enhanced with tenant config
      industry: null, // Could be enhanced with tenant config
      createdAt: new Date(),
    },
  });

  return created.id;
}

/**
 * Ensure DimCustomer record exists
 */
export async function ensureDimCustomer(tenantId: string, customerId: string): Promise<string> {
  const existing = await prisma.dimCustomer.findUnique({
    where: { tenantId_customerId: { tenantId, customerId } },
  });

  if (existing) {
    return existing.id;
  }

  // Load customer details
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, tenantId },
    select: { id: true, code: true, name: true, type: true },
  });

  if (!customer) {
    throw new Error(`Customer ${customerId} not found`);
  }

  const created = await prisma.dimCustomer.create({
    data: {
      tenantId,
      customerId,
      code: customer.code || customerId,
      name: customer.name || customerId,
      type: customer.type || null,
      industry: null, // Could be enhanced
      region: null, // Could be enhanced
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return created.id;
}

/**
 * Ensure DimProduct record exists
 */
export async function ensureDimProduct(tenantId: string, sku: string): Promise<string> {
  const existing = await prisma.dimProduct.findUnique({
    where: { tenantId_sku: { tenantId, sku } },
  });

  if (existing) {
    return existing.id;
  }

  // Load inventory item details
  const item = await prisma.inventoryItem.findFirst({
    where: { tenantId, sku },
    select: { sku: true },
  });

  const created = await prisma.dimProduct.create({
    data: {
      tenantId,
      sku,
      name: sku, // Could be enhanced with product master
      category: null,
      brand: null,
      unitOfMeasure: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return created.id;
}

/**
 * Ensure DimLocation record exists
 */
export async function ensureDimLocation(
  tenantId: string,
  warehouseId: string,
  locationId?: string | null
): Promise<string> {
  const key = { tenantId, warehouseId, locationId: locationId || null };
  const existing = await prisma.dimLocation.findUnique({
    where: { tenantId_warehouseId_locationId: key },
  });

  if (existing) {
    return existing.id;
  }

  // Load warehouse details
  const warehouse = await prisma.warehouse.findFirst({
    where: { id: warehouseId, tenantId },
    select: { id: true, code: true, name: true },
  });

  if (!warehouse) {
    throw new Error(`Warehouse ${warehouseId} not found`);
  }

  let locationCode: string | null = null;
  let locationName: string | null = null;

  if (locationId) {
    const location = await prisma.location.findFirst({
      where: { id: locationId, tenantId },
      select: { code: true, name: true },
    });
    locationCode = location?.code || null;
    locationName = location?.name || null;
  }

  const created = await prisma.dimLocation.create({
    data: {
      tenantId,
      warehouseId,
      locationId: locationId || null,
      warehouseCode: warehouse.code || warehouseId,
      locationCode,
      warehouseName: warehouse.name || warehouseId,
      locationName,
      type: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return created.id;
}

/**
 * Ensure DimProject record exists
 */
export async function ensureDimProject(tenantId: string, projectId: string): Promise<string> {
  const existing = await prisma.dimProject.findUnique({
    where: { tenantId_projectId: { tenantId, projectId } },
  });

  if (existing) {
    return existing.id;
  }

  // Load project details
  const project = await prisma.project.findFirst({
    where: { id: projectId, tenantId },
    select: { id: true, code: true, name: true, customerId: true, status: true },
  });

  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  const created = await prisma.dimProject.create({
    data: {
      tenantId,
      projectId,
      code: project.code || projectId,
      name: project.name || projectId,
      customerId: project.customerId || null,
      status: project.status || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return created.id;
}

/**
 * Create FactInvoice record (idempotent)
 */
export async function upsertFactInvoice(
  tenantId: string,
  invoiceId: string,
  invoiceNumber: string,
  customerId: string,
  total: number,
  tax: number,
  discount: number,
  currency: string,
  status: string,
  createdAt: Date
): Promise<void> {
  // Check if already exists
  const existing = await prisma.factInvoice.findFirst({
    where: { tenantId, invoiceId },
  });

  if (existing) {
    return; // Idempotent - already exists
  }

  const dateId = await ensureDimDate(createdAt);
  const tenantDimId = await ensureDimTenant(tenantId);
  const customerDimId = await ensureDimCustomer(tenantId, customerId);

  await prisma.factInvoice.create({
    data: {
      tenantId,
      dateId,
      tenantDimId,
      customerDimId,
      invoiceId,
      invoiceNumber,
      total,
      tax,
      discount,
      net: total - tax - discount,
      currency,
      status,
      createdAt,
    },
  });
}

/**
 * Create FactOrder record (idempotent)
 */
export async function upsertFactOrder(
  tenantId: string,
  orderId: string,
  orderNumber: string,
  customerId: string,
  total: number,
  currency: string,
  status: string,
  createdAt: Date
): Promise<void> {
  const existing = await prisma.factOrder.findFirst({
    where: { tenantId, orderId },
  });

  if (existing) {
    return;
  }

  const dateId = await ensureDimDate(createdAt);
  const tenantDimId = await ensureDimTenant(tenantId);
  const customerDimId = await ensureDimCustomer(tenantId, customerId);

  await prisma.factOrder.create({
    data: {
      tenantId,
      dateId,
      tenantDimId,
      customerDimId,
      orderId,
      orderNumber,
      total,
      currency,
      status,
      createdAt,
    },
  });
}

/**
 * Create FactReceipt record (idempotent)
 */
export async function upsertFactReceipt(
  tenantId: string,
  receiptId: string,
  receiptNumber: string,
  customerId: string | null,
  channelId: string | null,
  total: number,
  discount: number,
  tax: number,
  currency: string,
  paymentMethod: string,
  createdAt: Date
): Promise<void> {
  const existing = await prisma.factReceipt.findFirst({
    where: { tenantId, receiptId },
  });

  if (existing) {
    return;
  }

  const dateId = await ensureDimDate(createdAt);
  const tenantDimId = await ensureDimTenant(tenantId);
  const customerDimId = customerId ? await ensureDimCustomer(tenantId, customerId) : null;
  const channelDimId = channelId ? await ensureDimChannel(tenantId, channelId) : null;

  await prisma.factReceipt.create({
    data: {
      tenantId,
      dateId,
      tenantDimId,
      customerDimId,
      channelDimId,
      receiptId,
      receiptNumber,
      total,
      discount,
      tax,
      net: total - tax - discount,
      currency,
      paymentMethod,
      createdAt,
    },
  });
}

/**
 * Create FactProjectWip record (idempotent)
 */
export async function upsertFactProjectWip(
  tenantId: string,
  wipLedgerId: string,
  projectId: string,
  customerId: string | null,
  amount: number,
  currency: string,
  type: string,
  billed: boolean,
  createdAt: Date
): Promise<void> {
  const existing = await prisma.factProjectWip.findFirst({
    where: { tenantId, wipLedgerId },
  });

  if (existing) {
    return;
  }

  const dateId = await ensureDimDate(createdAt);
  const tenantDimId = await ensureDimTenant(tenantId);
  const projectDimId = await ensureDimProject(tenantId, projectId);
  const customerDimId = customerId ? await ensureDimCustomer(tenantId, customerId) : null;

  await prisma.factProjectWip.create({
    data: {
      tenantId,
      dateId,
      tenantDimId,
      projectDimId,
      customerDimId,
      wipLedgerId,
      amount,
      currency,
      type,
      billed,
      createdAt,
    },
  });
}

/**
 * Create FactInventoryMovement record (idempotent)
 */
export async function upsertFactInventoryMovement(
  tenantId: string,
  stockMoveId: string,
  sku: string,
  warehouseId: string,
  locationId: string | null,
  qty: number,
  unitCost: number,
  totalCost: number,
  type: string,
  createdAt: Date
): Promise<void> {
  const existing = await prisma.factInventoryMovement.findFirst({
    where: { tenantId, stockMoveId },
  });

  if (existing) {
    return;
  }

  const dateId = await ensureDimDate(createdAt);
  const tenantDimId = await ensureDimTenant(tenantId);
  const productDimId = await ensureDimProduct(tenantId, sku);
  const locationDimId = await ensureDimLocation(tenantId, warehouseId, locationId);

  await prisma.factInventoryMovement.create({
    data: {
      tenantId,
      dateId,
      tenantDimId,
      productDimId,
      locationDimId,
      stockMoveId,
      qty,
      unitCost,
      totalCost,
      type,
      createdAt,
    },
  });
}

/**
 * Ensure DimChannel record exists
 */
async function ensureDimChannel(tenantId: string, channelId: string): Promise<string> {
  const existing = await prisma.dimChannel.findUnique({
    where: { tenantId_channelId: { tenantId, channelId } },
  });

  if (existing) {
    return existing.id;
  }

  // For now, create a default channel entry
  // Could be enhanced with Store/Channel master data
  const created = await prisma.dimChannel.create({
    data: {
      tenantId,
      channelId,
      code: channelId,
      name: channelId,
      type: "pos", // Default
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return created.id;
}

/**
 * Helper: Get week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

