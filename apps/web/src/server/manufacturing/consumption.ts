import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function issueMaterialsToWorkOrder(
  scope: { tenantId: string; entityId?: string | null },
  workOrderId: string,
  issues: Array<{
    sku: string;
    qty: number;
    locationId?: string | null;
    lotId?: string | null;
  }>,
  actorId: string
) {
  // Phase 5A: Use new material issue service
  const { issueMaterialsToWorkOrder: issueMaterials } = await import("@/server/manufacturing/material-issue");
  return issueMaterials(scope, workOrderId, issues, actorId);
}

export async function returnMaterialsFromWorkOrder(
  scope: { tenantId: string; entityId?: string | null },
  workOrderId: string,
  returns: Array<{
    sku: string;
    qty: number;
    locationId?: string | null;
    lotId?: string | null;
  }>,
  actorId: string
) {
  // Phase 5A: Material returns not yet implemented - use material issue with negative qty or separate service
  throw Object.assign(new Error("Material returns not implemented in v1. Use material issue adjustments."), { code: 501 });
}

export async function postLabourToWorkOrder(scope: { tenantId: string; entityId?: string | null }) {
  // Phase 5A: Labour posting not in scope for v1 - use timesheet/project WIP flows
  throw Object.assign(new Error("Labour posting not implemented in v1. Use project timesheet flows for labour tracking."), { code: 501 });
}


