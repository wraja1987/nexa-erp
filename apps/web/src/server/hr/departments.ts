import { assertLegalEntityAccess } from "@/lib/finance/entity";

export type DepartmentInput = { code: string; name: string };

export async function listDepartments(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Schema gap: no Department model present
  return [];
}

export async function createDepartment(_scope: { tenantId: string; entityId?: string | null }, _data: DepartmentInput) {
  throw Object.assign(new Error("not_supported"), { code: 501 });
}

export async function updateDepartment(_scope: { tenantId: string; entityId?: string | null }, _id: string, _data: Partial<DepartmentInput>) {
  throw Object.assign(new Error("not_supported"), { code: 501 });
}


