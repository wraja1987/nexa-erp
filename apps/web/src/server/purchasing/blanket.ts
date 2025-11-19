/**
 * Phase 6 — Blanket Purchase Orders
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { PurchaseOrderCreated } from "@/server/events/types";
import { auditEvent } from "@/lib/observability/audit";

export interface BlanketPOInput {
  supplierId: string;
  number: string;
  startDate: Date;
  endDate: Date;
  lines: Array<{ sku: string; qty: number; price: number }>;
}

export interface BlanketPOReleaseInput {
  blanketPoId: string;
  number: string;
  qty: number;
}

export async function listBlanket(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const blanketPos = await prisma.blanketPO.findMany({
    where: { tenantId: scope.tenantId },
    include: {
      lines: true,
      releases: true,
      supplier: {
        select: { id: true, code: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return blanketPos.map((bpo) => ({
    id: bpo.id,
    tenantId: bpo.tenantId,
    supplierId: bpo.supplierId,
    supplier: bpo.supplier,
    number: bpo.number,
    startDate: bpo.startDate,
    endDate: bpo.endDate,
    status: bpo.status,
    lines: bpo.lines,
    releases: bpo.releases,
    createdAt: bpo.createdAt,
    updatedAt: bpo.updatedAt,
  }));
}

export async function createBlanket(
  scope: { tenantId: string; entityId?: string | null },
  input: BlanketPOInput,
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

  // Create blanket PO with lines
  const blanketPo = await prisma.blanketPO.create({
    data: {
      tenantId: scope.tenantId,
      supplierId: input.supplierId,
      number: input.number,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "active",
      lines: {
        create: input.lines.map((line) => ({
          sku: line.sku,
          qty: line.qty,
          price: line.price,
        })),
      },
    },
    include: {
      lines: true,
      supplier: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  // Publish event
  try {
    const event: PurchaseOrderCreated = {
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "purchasing.blanket.created",
      occurredAt: nowIso(),
      source: "purchasing.blanket",
      version: 1,
      payload: { blanketPoId: blanketPo.id, supplierId: input.supplierId, actorId },
    };
    await publishWithOutbox(event);
  } catch (error) {
    console.warn(`[BlanketPO] Failed to publish event:`, error);
  }

  // Audit log
  try {
    await auditEvent("purchasing.blanket.created", {
      tenantId: scope.tenantId,
      blanketPoId: blanketPo.id,
      supplierId: input.supplierId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return blanketPo;
}

export async function updateBlanket(
  scope: { tenantId: string; entityId?: string | null },
  blanketPoId: string,
  input: Partial<Pick<BlanketPOInput, "startDate" | "endDate" | "status">>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const blanketPo = await prisma.blanketPO.findFirst({
    where: { id: blanketPoId, tenantId: scope.tenantId },
  });

  if (!blanketPo) {
    throw Object.assign(new Error("Blanket PO not found"), { code: 404 });
  }

  const updated = await prisma.blanketPO.update({
    where: { id: blanketPoId },
    data: {
      ...(input.startDate && { startDate: input.startDate }),
      ...(input.endDate && { endDate: input.endDate }),
      ...(input.status && { status: input.status }),
    },
    include: {
      lines: true,
      releases: true,
    },
  });

  // Audit log
  try {
    await auditEvent("purchasing.blanket.updated", {
      tenantId: scope.tenantId,
      blanketPoId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}

export async function createRelease(
  scope: { tenantId: string; entityId?: string | null },
  input: BlanketPOReleaseInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const blanketPo = await prisma.blanketPO.findFirst({
    where: { id: input.blanketPoId, tenantId: scope.tenantId },
  });

  if (!blanketPo) {
    throw Object.assign(new Error("Blanket PO not found"), { code: 404 });
  }

  const release = await prisma.blanketPORelease.create({
    data: {
      blanketPoId: input.blanketPoId,
      number: input.number,
      qty: input.qty,
    },
  });

  // Audit log
  try {
    await auditEvent("purchasing.blanket.release.created", {
      tenantId: scope.tenantId,
      blanketPoId: input.blanketPoId,
      releaseId: release.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return release;
}
