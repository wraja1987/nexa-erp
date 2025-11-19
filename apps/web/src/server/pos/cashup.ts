/**
 * Phase 9 — POS Cash-up
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { prisma } from "@/lib/prisma";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { PosCashupPreviewed } from "@/server/events/types";
import { auditEvent } from "@/lib/observability/audit";

export interface CashupSubmission {
  sessionId: string;
  shiftId: string;
  storeId: string;
  cashExpected: number;
  cashActual: number;
  cardExpected: number;
  cardActual: number;
}

export async function getCashupPreview(scope: { tenantId: string; entityId?: string | null }, sessionId?: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  try {
    let payments: any[] = [];
    let invoiceCount = 0;

    if (sessionId) {
      // Get payments for specific session
      const session = await prisma.posSession.findFirst({
        where: { id: sessionId, tenantId: scope.tenantId },
        include: {
          shift: {
            include: {
              sales: {
                include: {
                  payments: true,
                },
              },
            },
          },
        },
      });

      if (session) {
        // Aggregate payments from sales in this session's shift
        for (const sale of session.shift.sales) {
          payments.push(...sale.payments);
        }
        invoiceCount = session.shift.sales.length;
      }
    } else {
      // Tenant-wide preview (fallback)
      payments = await prisma.posPayment.findMany({
        where: { tenantId: scope.tenantId },
        select: { method: true, amount: true },
      });
      invoiceCount = await prisma.posSale.count({ where: { tenantId: scope.tenantId } });
    }

    const byMethod: Record<string, { count: number; total: number }> = {};
    let totalAmount = 0;
    for (const p of payments) {
      const key = p.method || "UNKNOWN";
      if (!byMethod[key]) byMethod[key] = { count: 0, total: 0 };
      byMethod[key].count += 1;
      totalAmount += Number(p.amount);
      byMethod[key].total += Number(p.amount);
    }

    const result = {
      supported: true,
      summary: {
        payments: { byMethod, totalAmount },
        invoices: { count: invoiceCount },
      },
    };

    // Publish event
    try {
      const cashTotal = byMethod["cash"]?.total || 0;
      const cardTotal = byMethod["card"]?.total || 0;
      const event: PosCashupPreviewed = {
        id: newEventId(),
        tenantId: scope.tenantId,
        type: "pos.cashup.previewed",
        occurredAt: nowIso(),
        source: "pos.cashup",
        version: 1,
        payload: {
          cashupId: `cashup-${Date.now()}`,
          storeCode: sessionId ? "session-based" : "tenant-wide",
          shiftId: sessionId || "tenant-wide",
          totalCashMinor: cashTotal * 100,
          totalCardMinor: cardTotal * 100,
          previewedAt: nowIso(),
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[POS] Failed to publish cashup.previewed event:`, error);
    }

    return result;
  } catch (error: any) {
    return { supported: false, message: String(error?.message || "Preview error") };
  }
}

export async function submitCashup(
  scope: { tenantId: string; entityId?: string | null },
  input: CashupSubmission,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify session exists
  const session = await prisma.posSession.findFirst({
    where: { id: input.sessionId, tenantId: scope.tenantId },
  });

  if (!session) {
    throw Object.assign(new Error("Session not found"), { code: 404 });
  }

  // Calculate variances
  const cashVariance = input.cashActual - input.cashExpected;
  const cardVariance = input.cardActual - input.cardExpected;

  // Record variances if any
  if (cashVariance !== 0) {
    await prisma.posVariance.create({
      data: {
        tenantId: scope.tenantId,
        sessionId: input.sessionId,
        shiftId: input.shiftId,
        type: "cash",
        expected: input.cashExpected,
        actual: input.cashActual,
        variance: cashVariance,
        reason: "Cash-up submission",
        resolved: false,
      },
    });
  }

  if (cardVariance !== 0) {
    await prisma.posVariance.create({
      data: {
        tenantId: scope.tenantId,
        sessionId: input.sessionId,
        shiftId: input.shiftId,
        type: "card",
        expected: input.cardExpected,
        actual: input.cardActual,
        variance: cardVariance,
        reason: "Cash-up submission",
        resolved: false,
      },
    });
  }

  // Audit log
  try {
    await auditEvent("pos.cashup.submitted", {
      tenantId: scope.tenantId,
      sessionId: input.sessionId,
      shiftId: input.shiftId,
      cashExpected: input.cashExpected,
      cashActual: input.cashActual,
      cardExpected: input.cardExpected,
      cardActual: input.cardActual,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return {
    ok: true,
    cashVariance,
    cardVariance,
    totalVariance: cashVariance + cardVariance,
  };
}
