import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function listWorkCenters(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Derive from capacity calendar and routing steps
  const [cap, steps] = await Promise.all([
    prisma.capacityCalendar.findMany({
      where: { tenantId: scope.tenantId },
      select: { resourceCode: true, availableMins: true },
    }),
    prisma.routingStep.findMany({
      where: { tenantId: scope.tenantId, resourceCode: { not: null } },
      select: { resourceCode: true },
    }),
  ]);
  const codes = new Set<string>();
  for (const r of cap) if (r.resourceCode) codes.add(r.resourceCode);
  for (const r of steps) if (r.resourceCode) codes.add(r.resourceCode as string);
  const totals: Record<string, number> = {};
  for (const r of cap) totals[r.resourceCode] = (totals[r.resourceCode] || 0) + (r.availableMins || 0);
  return Array.from(codes).sort().map((code) => ({ code, availableMins: totals[code] || 0 }));
}

export async function createWorkCenter() {
  // No WorkCenter table; safe subset is read-only
  throw Object.assign(new Error("not_implemented"), { code: 501 });
}

export async function updateWorkCenter() {
  throw Object.assign(new Error("not_implemented"), { code: 501 });
}


