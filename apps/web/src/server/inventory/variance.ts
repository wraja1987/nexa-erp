import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function listVariances(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // No variance table; could read from AuditLog if we later record variances there.
  return [];
}

export async function recordVariance() {
  // Without a dedicated variance ledger and to avoid hidden side effects, return 501
  throw Object.assign(new Error("not_implemented"), { code: 501 });
}


