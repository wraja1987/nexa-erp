/**
 * Phase 8 — Sales Quotes
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import type { SalesQuoteCreated, SalesQuoteSent, SalesQuoteAccepted, SalesQuoteRejected } from "@/server/events/types";
import { newEventId, nowIso } from "@/server/events/types";

export interface SalesQuoteInput {
  customerId: string;
  opportunityId?: string;
  number: string;
  validUntil?: Date;
  lines: Array<{ sku: string; description: string; qty: number; price: number }>;
}

export async function listQuotes(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const quotes = await prisma.salesQuote.findMany({
    where: { tenantId: scope.tenantId },
    include: {
      lines: true,
      customer: {
        select: { id: true, code: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return quotes;
}

export async function getQuote(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const quote = await prisma.salesQuote.findFirst({
    where: { id, tenantId: scope.tenantId },
    include: {
      lines: true,
      customer: true,
    },
  });

  if (!quote) {
    throw Object.assign(new Error("Quote not found"), { code: 404 });
  }

  return quote;
}

export async function createQuote(
  scope: { tenantId: string; entityId?: string | null },
  input: SalesQuoteInput,
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

  // Calculate total
  const total = input.lines.reduce((sum, line) => sum + line.qty * line.price, 0);

  // Verify opportunity exists if provided
  if (input.opportunityId) {
    const opportunity = await prisma.crmOpportunity.findFirst({
      where: { id: input.opportunityId, tenantId: scope.tenantId },
    });
    if (!opportunity) {
      throw Object.assign(new Error("Opportunity not found"), { code: 404 });
    }
  }

  // Create quote with lines
  const quote = await prisma.salesQuote.create({
    data: {
      tenantId: scope.tenantId,
      customerId: input.customerId,
      opportunityId: input.opportunityId || null,
      number: input.number,
      version: 1,
      status: "draft",
      validUntil: input.validUntil || null,
      total,
      currency: "GBP",
      lines: {
        create: input.lines.map((line, idx) => ({
          lineNo: idx + 1,
          sku: line.sku,
          description: line.description,
          qty: line.qty,
          price: line.price,
          total: line.qty * line.price,
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
    await auditEvent("sales.quote.created", {
      tenantId: scope.tenantId,
      quoteId: quote.id,
      customerId: input.customerId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  // Emit domain event
  try {
    await publishWithOutbox<SalesQuoteCreated>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "sales.quote.created",
      occurredAt: nowIso(),
      source: "sales.quotes",
      version: 1,
      payload: {
        quoteId: quote.id,
        opportunityId: quote.opportunityId || undefined,
        customerId: quote.customerId,
        number: quote.number,
        total: Number(quote.total),
        currency: quote.currency,
        createdAt: quote.createdAt.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[Sales] Failed to emit quote.created event:", error);
  }

  return quote;
}

export async function updateQuote(
  scope: { tenantId: string; entityId?: string | null },
  quoteId: string,
  input: Partial<Pick<SalesQuoteInput, "validUntil" | "lines"> & { status: string }>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const quote = await prisma.salesQuote.findFirst({
    where: { id: quoteId, tenantId: scope.tenantId },
  });

  if (!quote) {
    throw Object.assign(new Error("Quote not found"), { code: 404 });
  }

  // If lines are updated, delete old lines and create new ones
  if (input.lines) {
    await prisma.salesQuoteLine.deleteMany({
      where: { quoteId },
    });

    const total = input.lines.reduce((sum, line) => sum + line.qty * line.price, 0);

    await prisma.salesQuote.update({
      where: { id: quoteId },
      data: {
        total,
        ...(input.validUntil !== undefined && { validUntil: input.validUntil || null }),
        ...(input.status && { status: input.status }),
        lines: {
          create: input.lines.map((line, idx) => ({
            lineNo: idx + 1,
            sku: line.sku,
            description: line.description,
            qty: line.qty,
            price: line.price,
            total: line.qty * line.price,
          })),
        },
      },
    });
  } else {
    await prisma.salesQuote.update({
      where: { id: quoteId },
      data: {
        ...(input.validUntil !== undefined && { validUntil: input.validUntil || null }),
        ...(input.status && { status: input.status }),
      },
    });
  }

  const updated = await getQuote(scope, quoteId);

  // Audit log
  try {
    await auditEvent("sales.quote.updated", {
      tenantId: scope.tenantId,
      quoteId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}

export async function duplicateQuoteAsNewVersion(
  scope: { tenantId: string; entityId?: string | null },
  quoteId: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const original = await prisma.salesQuote.findFirst({
    where: { id: quoteId, tenantId: scope.tenantId },
    include: { lines: true },
  });

  if (!original) {
    throw Object.assign(new Error("Quote not found"), { code: 404 });
  }

  // Create new version
  const newQuote = await prisma.salesQuote.create({
    data: {
      tenantId: scope.tenantId,
      customerId: original.customerId,
      number: `${original.number}-v${original.version + 1}`,
      version: original.version + 1,
      status: "draft",
      validUntil: original.validUntil,
      total: original.total,
      currency: original.currency,
      lines: {
        create: original.lines.map((line) => ({
          lineNo: line.lineNo,
          sku: line.sku,
          description: line.description,
          qty: line.qty,
          price: line.price,
          total: line.total,
        })),
      },
    },
    include: {
      lines: true,
    },
  });

  // Audit log
  try {
    await auditEvent("sales.quote.duplicated", {
      tenantId: scope.tenantId,
      originalQuoteId: quoteId,
      newQuoteId: newQuote.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return newQuote;
}

/**
 * Send a quote (mark as sent)
 * Phase 4A - Depth Pass: Full quote lifecycle
 */
export async function sendQuote(
  scope: { tenantId: string; entityId?: string | null },
  quoteId: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const quote = await prisma.salesQuote.findFirst({
    where: { id: quoteId, tenantId: scope.tenantId },
  });

  if (!quote) {
    throw Object.assign(new Error("Quote not found"), { code: 404 });
  }

  if (quote.status !== "draft") {
    throw Object.assign(new Error(`Cannot send quote with status: ${quote.status}`), { code: 400 });
  }

  const updated = await prisma.salesQuote.update({
    where: { id: quoteId },
    data: {
      status: "sent",
      sentAt: new Date(),
    },
  });

  // Emit domain event
  try {
    await publishWithOutbox<SalesQuoteSent>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "sales.quote.sent",
      occurredAt: nowIso(),
      source: "sales.quotes",
      version: 1,
      payload: {
        quoteId,
        sentAt: updated.sentAt!.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[Sales] Failed to emit quote.sent event:", error);
  }

  return updated;
}

/**
 * Accept a quote
 * Phase 4A - Depth Pass: Full quote lifecycle
 */
export async function acceptQuote(
  scope: { tenantId: string; entityId?: string | null },
  quoteId: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const quote = await prisma.salesQuote.findFirst({
    where: { id: quoteId, tenantId: scope.tenantId },
  });

  if (!quote) {
    throw Object.assign(new Error("Quote not found"), { code: 404 });
  }

  if (quote.status !== "sent" && quote.status !== "draft") {
    throw Object.assign(new Error(`Cannot accept quote with status: ${quote.status}`), { code: 400 });
  }

  const updated = await prisma.salesQuote.update({
    where: { id: quoteId },
    data: {
      status: "accepted",
      acceptedAt: new Date(),
    },
  });

  // Emit domain event
  try {
    await publishWithOutbox<SalesQuoteAccepted>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "sales.quote.accepted",
      occurredAt: nowIso(),
      source: "sales.quotes",
      version: 1,
      payload: {
        quoteId,
        acceptedAt: updated.acceptedAt!.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[Sales] Failed to emit quote.accepted event:", error);
  }

  return updated;
}

/**
 * Reject a quote
 * Phase 4A - Depth Pass: Full quote lifecycle
 */
export async function rejectQuote(
  scope: { tenantId: string; entityId?: string | null },
  quoteId: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const quote = await prisma.salesQuote.findFirst({
    where: { id: quoteId, tenantId: scope.tenantId },
  });

  if (!quote) {
    throw Object.assign(new Error("Quote not found"), { code: 404 });
  }

  if (quote.status === "accepted" || quote.status === "rejected") {
    throw Object.assign(new Error(`Cannot reject quote with status: ${quote.status}`), { code: 400 });
  }

  const updated = await prisma.salesQuote.update({
    where: { id: quoteId },
    data: {
      status: "rejected",
      rejectedAt: new Date(),
    },
  });

  // Emit domain event
  try {
    await publishWithOutbox<SalesQuoteRejected>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "sales.quote.rejected",
      occurredAt: nowIso(),
      source: "sales.quotes",
      version: 1,
      payload: {
        quoteId,
        rejectedAt: updated.rejectedAt!.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[Sales] Failed to emit quote.rejected event:", error);
  }

  return updated;
}
