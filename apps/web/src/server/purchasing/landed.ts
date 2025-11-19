/**
 * Phase 6 — Landed Costs
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface LandedCostInput {
  poId?: string;
  asnId?: string;
  type: string; // freight, duty, insurance, etc.
  amount: number;
  allocatedTo: "inventory" | "cogs";
}

export async function listLandedCosts(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const costs = await prisma.landedCost.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return costs;
}

export async function allocateLandedCost(
  scope: { tenantId: string; entityId?: string | null },
  input: LandedCostInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify PO or ASN exists if provided
  if (input.poId) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: input.poId, tenantId: scope.tenantId },
    });
    if (!po) {
      throw Object.assign(new Error("Purchase Order not found"), { code: 404 });
    }
  }

  if (input.asnId) {
    const asn = await prisma.asn.findFirst({
      where: { id: input.asnId, tenantId: scope.tenantId },
    });
    if (!asn) {
      throw Object.assign(new Error("ASN not found"), { code: 404 });
    }
  }

  const landedCost = await prisma.landedCost.create({
    data: {
      tenantId: scope.tenantId,
      poId: input.poId || null,
      asnId: input.asnId || null,
      type: input.type,
      amount: input.amount,
      allocatedTo: input.allocatedTo,
    },
  });

  // Audit log
  try {
    await auditEvent("purchasing.landedcost.created", {
      tenantId: scope.tenantId,
      landedCostId: landedCost.id,
      poId: input.poId,
      asnId: input.asnId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return landedCost;
}
