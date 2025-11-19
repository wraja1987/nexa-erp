import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { prisma } from "@/lib/prisma";

async function buildSummary(scope: { tenantId: string }) {
  try {
    const payments = await prisma.customerPayment.findMany({
      where: { tenantId: scope.tenantId },
      select: { method: true, amount: true },
    });
    const byMethod: Record<string, { count: number; total: number }> = {};
    let totalAmount = 0;
    for (const p of payments) {
      const key = p.method || "UNKNOWN";
      if (!byMethod[key]) byMethod[key] = { count: 0, total: 0 };
      byMethod[key].count += 1;
      totalAmount += Number(p.amount);
      byMethod[key].total += Number(p.amount);
    }
    const invoiceCount = await prisma.customerInvoice.count({ where: { tenantId: scope.tenantId } });
    return {
      supported: true,
      summary: {
        payments: { byMethod, totalAmount },
        invoices: { count: invoiceCount },
      },
      gaps: ["schema gap: no POS sessions/tills; report is tenant-wide"],
    };
  } catch {
    return { supported: false, message: "schema gap: missing payment/invoice models" };
  }
}

export async function getZReport(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return buildSummary({ tenantId: scope.tenantId });
}

export async function getXReport(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return buildSummary({ tenantId: scope.tenantId });
}


