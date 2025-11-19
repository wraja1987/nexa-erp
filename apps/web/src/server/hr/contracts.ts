import { assertLegalEntityAccess } from "@/lib/finance/entity";

export type ContractInput = { employeeId: string; type?: string; rateMinor?: number };

export async function listContracts(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Schema gap: no Contract model present
  return [];
}

export async function createContractForEmployee(_scope: { tenantId: string; entityId?: string | null }, _data: ContractInput) {
  throw Object.assign(new Error("not_supported"), { code: 501 });
}

export async function updateContract(_scope: { tenantId: string; entityId?: string | null }, _id: string, _data: Partial<ContractInput>) {
  throw Object.assign(new Error("not_supported"), { code: 501 });
}


