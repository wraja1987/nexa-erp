/**
 * Phase 13 — Partner Management
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

export type PartnerInfo = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  tenantCount?: number;
  createdAt: Date;
};

export type TenantForPartner = {
  tenantId: string;
  tenantName: string;
  joinedAt: Date;
  subscriptionStatus?: string;
};

/**
 * List partners for super-admin view.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listPartnersForSuperAdmin(): Promise<{
  supported: boolean;
  partners: PartnerInfo[];
  message?: string;
}> {
  try {
    const partners = await prisma.partner.findMany({
      include: {
        tenants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const partnerInfos: PartnerInfo[] = partners.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      active: p.active,
      tenantCount: p.tenants.length,
      createdAt: p.createdAt,
    }));

    return {
      supported: true,
      partners: partnerInfos,
    };
  } catch (error: any) {
    return {
      supported: false,
      partners: [],
      message: String(error?.message || "Failed to list partners"),
    };
  }
}

/**
 * List tenants for a specific partner.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listTenantsForPartner(partnerId: string): Promise<{
  supported: boolean;
  tenants: TenantForPartner[];
  message?: string;
}> {
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        tenants: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!partner) {
      return {
        supported: false,
        tenants: [],
        message: "Partner not found",
      };
    }

    // Get subscription status for each tenant
    const tenantIds = partner.tenants.map((pt) => pt.tenantId);
    const subscriptions = await prisma.subscription.findMany({
      where: {
        tenantId: { in: tenantIds },
        status: { not: "cancelled" },
      },
      select: {
        tenantId: true,
        status: true,
      },
    });

    const subscriptionMap = new Map(subscriptions.map((s) => [s.tenantId, s.status]));

    const tenants: TenantForPartner[] = partner.tenants.map((pt) => ({
      tenantId: pt.tenantId,
      tenantName: pt.tenant.name,
      joinedAt: pt.joinedAt,
      subscriptionStatus: subscriptionMap.get(pt.tenantId) || undefined,
    }));

    return {
      supported: true,
      tenants,
    };
  } catch (error: any) {
    return {
      supported: false,
      tenants: [],
      message: String(error?.message || "Failed to list tenants for partner"),
    };
  }
}

/**
 * Create partner
 */
export async function createPartner(
  code: string,
  name: string,
  actorId: string
): Promise<{ supported: boolean; partner?: PartnerInfo; message?: string }> {
  try {
    const partner = await prisma.partner.create({
      data: {
        code,
        name,
        active: true,
      },
    });

    // Audit log
    try {
      await auditEvent("partner.created", {
        partnerId: partner.id,
        code,
        name,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      partner: {
        id: partner.id,
        code: partner.code,
        name: partner.name,
        active: partner.active,
        tenantCount: 0,
        createdAt: partner.createdAt,
      },
    };
  } catch (error: any) {
    return {
      supported: false,
      message: String(error?.message || "Failed to create partner"),
    };
  }
}

/**
 * Link tenant to partner
 */
export async function linkTenantToPartner(
  partnerId: string,
  tenantId: string,
  actorId: string
): Promise<{ supported: boolean; message?: string }> {
  try {
    // Check if partner exists
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return {
        supported: false,
        message: "Partner not found",
      };
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return {
        supported: false,
        message: "Tenant not found",
      };
    }

    // Create link
    await prisma.partnerTenant.create({
      data: {
        partnerId,
        tenantId,
      },
    });

    // Audit log
    try {
      await auditEvent("partner.tenant.linked", {
        partnerId,
        tenantId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return { supported: true };
  } catch (error: any) {
    return {
      supported: false,
      message: String(error?.message || "Failed to link tenant to partner"),
    };
  }
}
