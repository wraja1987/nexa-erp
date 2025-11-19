import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { computeScheduleForDocument } from "@/lib/finance/revenue";
import { DimensionFilters } from "@/lib/finance/dimensions";

export async function buildRevenueScheduleForTenant(
  scope: { tenantId: string; entityId?: string | null },
  from?: Date,
  to?: Date,
  _dimensions?: DimensionFilters
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const invs = await prisma.customerInvoice.findMany({
    where: { tenantId: scope.tenantId },
    select: { id: true, number: true, currency: true, total: true, issuedAt: true, dueAt: true },
  });
  const items = invs.map((inv) => {
    const schedule = computeScheduleForDocument(
      Number(inv.total || 0),
      new Date(inv.issuedAt as any),
      inv.dueAt ? new Date(inv.dueAt as any) : null,
      undefined
    );
    return {
      id: inv.id,
      number: inv.number,
      currency: inv.currency || "GBP",
      totalMinor: Number(inv.total || 0),
      schedule,
    };
  });
  const filter = (p: string) => {
    if (!from && !to) return true;
    const [y, m] = p.split("-").map(Number);
    const d = new Date(Date.UTC(y, (m || 1) - 1, 1));
    if (from && d < new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1))) return false;
    if (to && d > new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1))) return false;
    return true;
  };
  const totalsByPeriod = new Map<string, number>();
  for (const it of items) {
    for (const s of it.schedule) {
      if (!filter(s.period)) continue;
      totalsByPeriod.set(s.period, (totalsByPeriod.get(s.period) || 0) + s.amountMinor);
    }
  }
  const periods = Array.from(totalsByPeriod.entries())
    .map(([period, amountMinor]) => ({ period, amountMinor }))
    .sort((a, b) => (a.period < b.period ? -1 : 1));
  return { items, periods };
}

export async function buildRevenueSummary(
  scope: { tenantId: string; entityId?: string | null },
  asOf: Date,
  _dimensions?: DimensionFilters
) {
  const { items } = await buildRevenueScheduleForTenant(scope);
  const cutoff = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), 1));
  let recognised = 0;
  let total = 0;
  for (const it of items) {
    total += it.totalMinor;
    for (const s of it.schedule) {
      const [y, m] = s.period.split("-").map(Number);
      const d = new Date(Date.UTC(y, (m || 1) - 1, 1));
      if (d <= cutoff) recognised += s.amountMinor;
    }
  }
  const deferred = Math.max(0, total - recognised);
  return { recognised, deferred, asOf: cutoff.toISOString() };
}


