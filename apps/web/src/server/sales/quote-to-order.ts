/**
 * Phase 8 — Quote to Order Conversion
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { getQuote } from "./quotes";
import { createOrder } from "./orders";
import { auditEvent } from "@/lib/observability/audit";

export interface QuoteToOrderPreview {
  quoteId: string;
  orderNumber: string;
  customerId: string;
  total: number;
  lines: Array<{ sku: string; description: string; qty: number; price: number; total: number }>;
}

export async function buildOrderFromQuotePreview(
  scope: { tenantId: string; entityId?: string | null },
  quoteId: string
): Promise<QuoteToOrderPreview> {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const quote = await getQuote(scope, quoteId);

  if (quote.status !== "accepted" && quote.status !== "sent") {
    throw Object.assign(new Error("Quote must be accepted or sent to convert to order"), { code: 400 });
  }

  // Generate order number
  const orderNumber = `ORD-${quote.number}-${Date.now()}`;

  return {
    quoteId: quote.id,
    orderNumber,
    customerId: quote.customerId,
    total: Number(quote.total),
    lines: quote.lines.map((line) => ({
      sku: line.sku,
      description: line.description,
      qty: Number(line.qty),
      price: Number(line.price),
      total: Number(line.total),
    })),
  };
}

export async function confirmOrderFromQuote(
  scope: { tenantId: string; entityId?: string | null },
  quoteId: string,
  orderNumber: string,
  requestedDate?: Date,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const quote = await getQuote(scope, quoteId);

  if (quote.status !== "accepted" && quote.status !== "sent") {
    throw Object.assign(new Error("Quote must be accepted or sent to convert to order"), { code: 400 });
  }

  // Create order from quote lines
  const order = await createOrder(
    scope,
    {
      customerId: quote.customerId,
      number: orderNumber,
      quoteId: quote.id,
      requestedDate: requestedDate || undefined,
      lines: quote.lines.map((line) => ({
        sku: line.sku,
        description: line.description,
        qty: Number(line.qty),
        price: Number(line.price),
      })),
    },
    actorId
  );

  // Update quote status to indicate it was converted
  await prisma.salesQuote.update({
    where: { id: quoteId },
    data: { status: "accepted" },
  });

  // Audit log
  try {
    await auditEvent("sales.quote.converted_to_order", {
      tenantId: scope.tenantId,
      quoteId,
      orderId: order.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return order;
}
