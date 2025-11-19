/**
 * Phase 6 — Supplier Contracts
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface SupplierContractInput {
  supplierId: string;
  code: string;
  startDate: Date;
  endDate?: Date;
  terms?: Record<string, unknown>;
  tiers: Array<{ sku: string; qtyMin: number; price: number }>;
}

export async function listContracts(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const contracts = await prisma.supplierContract.findMany({
    where: { tenantId: scope.tenantId },
    include: {
      tiers: true,
      supplier: {
        select: { id: true, code: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return contracts.map((contract) => ({
    id: contract.id,
    tenantId: contract.tenantId,
    supplierId: contract.supplierId,
    supplier: contract.supplier,
    code: contract.code,
    startDate: contract.startDate,
    endDate: contract.endDate,
    status: contract.status,
    terms: contract.terms,
    tiers: contract.tiers,
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
  }));
}

export async function createContract(
  scope: { tenantId: string; entityId?: string | null },
  input: SupplierContractInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify supplier exists
  const supplier = await prisma.supplier.findFirst({
    where: { id: input.supplierId, tenantId: scope.tenantId },
  });

  if (!supplier) {
    throw Object.assign(new Error("Supplier not found"), { code: 404 });
  }

  // Create contract with tiers
  const contract = await prisma.supplierContract.create({
    data: {
      tenantId: scope.tenantId,
      supplierId: input.supplierId,
      code: input.code,
      startDate: input.startDate,
      endDate: input.endDate || null,
      status: "active",
      terms: input.terms || null,
      tiers: {
        create: input.tiers.map((tier) => ({
          sku: tier.sku,
          qtyMin: tier.qtyMin,
          price: tier.price,
        })),
      },
    },
    include: {
      tiers: true,
      supplier: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("purchasing.contract.created", {
      tenantId: scope.tenantId,
      contractId: contract.id,
      supplierId: input.supplierId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return contract;
}

export async function updateContract(
  scope: { tenantId: string; entityId?: string | null },
  contractId: string,
  input: Partial<Pick<SupplierContractInput, "startDate" | "endDate" | "status" | "terms">>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const contract = await prisma.supplierContract.findFirst({
    where: { id: contractId, tenantId: scope.tenantId },
  });

  if (!contract) {
    throw Object.assign(new Error("Contract not found"), { code: 404 });
  }

  const updated = await prisma.supplierContract.update({
    where: { id: contractId },
    data: {
      ...(input.startDate && { startDate: input.startDate }),
      ...(input.endDate !== undefined && { endDate: input.endDate || null }),
      ...(input.status && { status: input.status }),
      ...(input.terms !== undefined && { terms: input.terms || null }),
    },
    include: {
      tiers: true,
    },
  });

  // Audit log
  try {
    await auditEvent("purchasing.contract.updated", {
      tenantId: scope.tenantId,
      contractId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}
