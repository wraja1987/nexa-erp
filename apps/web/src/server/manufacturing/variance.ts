import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function calculateWorkOrderVariance(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // No cost detail to compute a meaningful variance across materials/labour/overhead
  throw Object.assign(new Error("not_implemented"), { code: 501 });
}

export async function postWorkOrderVariance(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // No GL mappings/variance accounts in schema for posting
  throw Object.assign(new Error("not_implemented"), { code: 501 });
}


