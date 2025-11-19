/**
 * Phase 13 — Tenant Localisation
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

export type TenantLocalisation = {
  supported: boolean;
  locale: string;
  currency: string;
  timezone: string;
  message?: string;
};

export type UpdateLocalisationInput = {
  locale?: string;
  currency?: string;
  timezone?: string;
};

/**
 * Get tenant localisation settings.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getTenantLocalisation(tenantId: string): Promise<TenantLocalisation> {
  // Get TenantConfig
  const config = await prisma.tenantConfig.findUnique({
    where: { tenantId },
  });

  // Get currency from Entity if TenantConfig doesn't exist
  let currency = config?.currency || "GBP";
  if (!config) {
    const entity = await prisma.entity.findFirst({
      where: { tenantId },
      select: { currencyCode: true },
    });
    currency = entity?.currencyCode || "GBP";
  }

  return {
    supported: true,
    locale: config?.locale || "en-GB",
    currency,
    timezone: config?.timezone || "Europe/London",
  };
}

/**
 * Update tenant localisation.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function updateTenantLocalisation(
  tenantId: string,
  input: UpdateLocalisationInput,
  actorId: string
): Promise<{ supported: boolean; updated: boolean; message?: string }> {
  // Upsert TenantConfig
  const config = await prisma.tenantConfig.upsert({
    where: { tenantId },
    update: {
      ...(input.locale && { locale: input.locale }),
      ...(input.timezone && { timezone: input.timezone }),
      ...(input.currency && { currency: input.currency }),
    },
    create: {
      tenantId,
      locale: input.locale || "en-GB",
      timezone: input.timezone || "Europe/London",
      currency: input.currency || "GBP",
    },
  });

  // Also update Entity.currencyCode if currency changed
  if (input.currency) {
    const entity = await prisma.entity.findFirst({
      where: { tenantId },
      select: { id: true },
    });

    if (entity) {
      await prisma.entity.update({
        where: { id: entity.id },
        data: { currencyCode: input.currency },
      });
    }
  }

  // Audit log
  try {
    await auditEvent("admin.localisation.updated", {
      tenantId,
      locale: input.locale,
      timezone: input.timezone,
      currency: input.currency,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return {
    supported: true,
    updated: true,
  };
}
