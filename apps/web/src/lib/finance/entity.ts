import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/auth/tenant.server";

export type LegalEntityRecord = { id: string; tenantId: string; name: string; currencyCode: string };

export function resolveLegalEntityScope(
  tenantId: string,
  requestedEntityId: string | null,
  entities: LegalEntityRecord[]
): { entityId: string | null; mode: "single-tenant" | "multi-entity-validated" | "tenant-wide" } {
  if (!entities || entities.length === 0) {
    return { entityId: null, mode: "tenant-wide" };
  }
  if (requestedEntityId) {
    const match = entities.find((e) => e.id === requestedEntityId && e.tenantId === tenantId);
    if (match) return { entityId: requestedEntityId, mode: "multi-entity-validated" };
    throw Object.assign(new Error("Forbidden"), { code: 403 });
  }
  if (entities.length === 1) {
    return { entityId: entities[0].id, mode: "single-tenant" };
  }
  return { entityId: null, mode: "tenant-wide" };
}

export async function getCurrentLegalEntityForUser() {
  const { tenantId } = await getSessionContext();
  const entities = await prisma.entity.findMany({
    where: { tenantId },
    select: { id: true, tenantId: true, name: true, currencyCode: true },
  });
  const scope = resolveLegalEntityScope(tenantId, null, entities as any);
  return { tenantId, scope, entities };
}

export async function assertLegalEntityAccess(requestedEntityId?: string | null) {
  const { tenantId } = await getSessionContext();
  const entities = await prisma.entity.findMany({
    where: { tenantId },
    select: { id: true, tenantId: true, name: true, currencyCode: true },
  });
  const scope = resolveLegalEntityScope(tenantId, requestedEntityId || null, entities as any);
  return { tenantId, ...scope };
}


