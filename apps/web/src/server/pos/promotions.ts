/**
 * Phase 9 — POS Promotions
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface PosPromotionInput {
  code: string;
  name: string;
  type: string; // discount, bogo, etc.
  conditions?: Record<string, unknown>;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export async function listPromotions(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const promotions = await prisma.posPromotion.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return promotions;
}

export async function createPromotion(
  scope: { tenantId: string; entityId?: string | null },
  input: PosPromotionInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const promotion = await prisma.posPromotion.create({
    data: {
      tenantId: scope.tenantId,
      code: input.code,
      name: input.name,
      type: input.type,
      conditions: input.conditions || null,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo || null,
      active: true,
    },
  });

  // Audit log
  try {
    await auditEvent("pos.promotion.created", {
      tenantId: scope.tenantId,
      promotionId: promotion.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return { ok: true, data: promotion };
}

export async function updatePromotion(
  scope: { tenantId: string; entityId?: string | null },
  promotionId: string,
  input: Partial<PosPromotionInput & { active: boolean }>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const promotion = await prisma.posPromotion.findFirst({
    where: { id: promotionId, tenantId: scope.tenantId },
  });

  if (!promotion) {
    throw Object.assign(new Error("Promotion not found"), { code: 404 });
  }

  const updated = await prisma.posPromotion.update({
    where: { id: promotionId },
    data: {
      ...(input.code && { code: input.code }),
      ...(input.name && { name: input.name }),
      ...(input.type && { type: input.type }),
      ...(input.conditions !== undefined && { conditions: input.conditions || null }),
      ...(input.effectiveFrom && { effectiveFrom: input.effectiveFrom }),
      ...(input.effectiveTo !== undefined && { effectiveTo: input.effectiveTo || null }),
      ...(input.active !== undefined && { active: input.active }),
    },
  });

  // Audit log
  try {
    await auditEvent("pos.promotion.updated", {
      tenantId: scope.tenantId,
      promotionId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return { ok: true, data: updated };
}
