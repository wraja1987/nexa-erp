/**
 * Phase 8 — Sales Orders
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import type { SalesOrderCreated, SalesOrderFulfilled } from "@/server/events/types";
import { newEventId, nowIso } from "@/server/events/types";

export interface SalesOrderInput {
  customerId: string;
  number: string;
  quoteId?: string;
  requestedDate?: Date;
  lines: Array<{ sku: string; description: string; qty: number; price: number }>;
}

export async function listOrders(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const orders = await prisma.salesOrder.findMany({
    where: { tenantId: scope.tenantId },
    include: {
      lines: true,
      customer: {
        select: { id: true, code: true, name: true },
      },
      quote: {
        select: { id: true, number: true },
      },
      reservations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
}

export async function getOrder(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const order = await prisma.salesOrder.findFirst({
    where: { id, tenantId: scope.tenantId },
    include: {
      lines: true,
      customer: true,
      quote: true,
      reservations: true,
    },
  });

  if (!order) {
    throw Object.assign(new Error("Order not found"), { code: 404 });
  }

  return order;
}

export async function createOrder(
  scope: { tenantId: string; entityId?: string | null },
  input: SalesOrderInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify customer exists
  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, tenantId: scope.tenantId },
  });

  if (!customer) {
    throw Object.assign(new Error("Customer not found"), { code: 404 });
  }

  // Verify quote exists if provided
  if (input.quoteId) {
    const quote = await prisma.salesQuote.findFirst({
      where: { id: input.quoteId, tenantId: scope.tenantId },
    });
    if (!quote) {
      throw Object.assign(new Error("Quote not found"), { code: 404 });
    }
  }

  // Calculate total
  const total = input.lines.reduce((sum, line) => sum + line.qty * line.price, 0);

  // Create order with lines
  const order = await prisma.salesOrder.create({
    data: {
      tenantId: scope.tenantId,
      customerId: input.customerId,
      number: input.number,
      quoteId: input.quoteId || null,
      status: "draft",
      total,
      currency: "GBP",
      orderDate: new Date(),
      requestedDate: input.requestedDate || null,
      lines: {
        create: input.lines.map((line, idx) => ({
          lineNo: idx + 1,
          sku: line.sku,
          description: line.description,
          qty: line.qty,
          price: line.price,
          total: line.qty * line.price,
          reservedQty: 0,
          backorderQty: 0,
        })),
      },
    },
    include: {
      lines: true,
      customer: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("sales.order.created", {
      tenantId: scope.tenantId,
      orderId: order.id,
      customerId: input.customerId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  // Emit domain event
  try {
    await publishWithOutbox<SalesOrderCreated>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "sales.order.created",
      occurredAt: nowIso(),
      source: "sales.orders",
      version: 1,
      payload: {
        orderId: order.id,
        quoteId: order.quoteId || undefined,
        customerId: order.customerId,
        number: order.number,
        total: Number(order.total),
        currency: order.currency,
        createdAt: order.createdAt.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[Sales] Failed to emit order.created event:", error);
  }

  return order;
}

export async function updateOrder(
  scope: { tenantId: string; entityId?: string | null },
  orderId: string,
  input: Partial<Pick<SalesOrderInput, "requestedDate" | "lines"> & { status: string }>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const order = await prisma.salesOrder.findFirst({
    where: { id: orderId, tenantId: scope.tenantId },
  });

  if (!order) {
    throw Object.assign(new Error("Order not found"), { code: 404 });
  }

  // If lines are updated, delete old lines and create new ones
  if (input.lines) {
    await prisma.salesOrderLine.deleteMany({
      where: { orderId },
    });

    const total = input.lines.reduce((sum, line) => sum + line.qty * line.price, 0);

    await prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        total,
        ...(input.requestedDate !== undefined && { requestedDate: input.requestedDate || null }),
        ...(input.status && { status: input.status }),
        lines: {
          create: input.lines.map((line, idx) => ({
            lineNo: idx + 1,
            sku: line.sku,
            description: line.description,
            qty: line.qty,
            price: line.price,
            total: line.qty * line.price,
            reservedQty: 0,
            backorderQty: 0,
          })),
        },
      },
    });
  } else {
    await prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        ...(input.requestedDate !== undefined && { requestedDate: input.requestedDate || null }),
        ...(input.status && { status: input.status }),
      },
    });
  }

  const updated = await getOrder(scope, orderId);

  // Audit log
  try {
    await auditEvent("sales.order.updated", {
      tenantId: scope.tenantId,
      orderId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}

export async function reserveStockForOrderLine(
  scope: { tenantId: string; entityId?: string | null },
  orderId: string,
  orderLineId: string,
  sku: string,
  qty: number,
  warehouseId?: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const order = await prisma.salesOrder.findFirst({
    where: { id: orderId, tenantId: scope.tenantId },
    include: { lines: true },
  });

  if (!order) {
    throw Object.assign(new Error("Order not found"), { code: 404 });
  }

  const line = order.lines.find((l) => l.id === orderLineId);
  if (!line) {
    throw Object.assign(new Error("Order line not found"), { code: 404 });
  }

  // Create reservation
  const reservation = await prisma.reservation.create({
    data: {
      tenantId: scope.tenantId,
      orderId,
      orderLineId,
      sku,
      qty,
      warehouseId: warehouseId || null,
      status: "reserved",
    },
  });

  // Update order line reserved quantity
  const newReservedQty = Number(line.reservedQty) + qty;
  await prisma.salesOrderLine.update({
    where: { id: orderLineId },
    data: { reservedQty: newReservedQty },
  });

  // Audit log
  try {
    await auditEvent("sales.order.reserved", {
      tenantId: scope.tenantId,
      orderId,
      orderLineId,
      reservationId: reservation.id,
      qty,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return reservation;
}

export async function markBackorder(
  scope: { tenantId: string; entityId?: string | null },
  orderId: string,
  orderLineId: string,
  qty: number,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const order = await prisma.salesOrder.findFirst({
    where: { id: orderId, tenantId: scope.tenantId },
    include: { lines: true },
  });

  if (!order) {
    throw Object.assign(new Error("Order not found"), { code: 404 });
  }

  const line = order.lines.find((l) => l.id === orderLineId);
  if (!line) {
    throw Object.assign(new Error("Order line not found"), { code: 404 });
  }

  // Update backorder quantity
  const newBackorderQty = Number(line.backorderQty) + qty;
  await prisma.salesOrderLine.update({
    where: { id: orderLineId },
    data: { backorderQty: newBackorderQty },
  });

  // Audit log
  try {
    await auditEvent("sales.order.backordered", {
      tenantId: scope.tenantId,
      orderId,
      orderLineId,
      qty,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return { ok: true, backorderQty: newBackorderQty };
}

/**
 * Mark order as fulfilled
 * Phase 4A - Depth Pass: Full order lifecycle
 */
export async function fulfillOrder(
  scope: { tenantId: string; entityId?: string | null },
  orderId: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const order = await prisma.salesOrder.findFirst({
    where: { id: orderId, tenantId: scope.tenantId },
  });

  if (!order) {
    throw Object.assign(new Error("Order not found"), { code: 404 });
  }

  if (order.status === "cancelled" || order.status === "invoiced") {
    throw Object.assign(new Error(`Cannot fulfill order with status: ${order.status}`), { code: 400 });
  }

  const updated = await prisma.salesOrder.update({
    where: { id: orderId },
    data: { status: "shipped" }, // Using "shipped" as fulfilled status
  });

  // Emit domain event
  try {
    await publishWithOutbox<SalesOrderFulfilled>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "sales.order.fulfilled",
      occurredAt: nowIso(),
      source: "sales.orders",
      version: 1,
      payload: {
        orderId,
        fulfilledAt: nowIso(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[Sales] Failed to emit order.fulfilled event:", error);
  }

  return updated;
}
