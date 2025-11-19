/**
 * Phase 14 — Practice Management
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

export type PracticeInfo = {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
  pcnId?: string;
  pcnName?: string;
  createdAt?: Date;
};

export type PracticeListResult = {
  supported: boolean;
  practices: PracticeInfo[];
  total?: number;
  message?: string;
};

export type PracticeDetailResult = {
  supported: boolean;
  practice: PracticeInfo | null;
  message?: string;
};

/**
 * List practices for tenant.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listPractices(
  tenantId: string,
  filters?: { pcnId?: string; search?: string; active?: boolean }
): Promise<PracticeListResult> {
  try {
    const where: any = { tenantId };
    if (filters?.pcnId) {
      where.pcnLinks = {
        some: {
          pcnId: filters.pcnId,
        },
      };
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const practices = await prisma.practice.findMany({
      where,
      include: {
        pcnLinks: {
          include: {
            pcn: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const practiceInfos: PracticeInfo[] = practices.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      address: p.address || undefined,
      phone: p.phone || undefined,
      email: p.email || undefined,
      pcnId: p.pcnLinks[0]?.pcnId,
      pcnName: p.pcnLinks[0]?.pcn.name,
      createdAt: p.createdAt,
    }));

    return {
      supported: true,
      practices: practiceInfos,
      total: practiceInfos.length,
    };
  } catch (e: any) {
    return {
      supported: false,
      practices: [],
      message: `Failed to list practices: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Get practice detail.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getPractice(tenantId: string, practiceId: string): Promise<PracticeDetailResult> {
  try {
    const practice = await prisma.practice.findFirst({
      where: {
        id: practiceId,
        tenantId,
      },
      include: {
        pcnLinks: {
          include: {
            pcn: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!practice) {
      return {
        supported: true,
        practice: null,
        message: "Practice not found",
      };
    }

    return {
      supported: true,
      practice: {
        id: practice.id,
        name: practice.name,
        code: practice.code,
        address: practice.address || undefined,
        phone: practice.phone || undefined,
        email: practice.email || undefined,
        pcnId: practice.pcnLinks[0]?.pcnId,
        pcnName: practice.pcnLinks[0]?.pcn.name,
        createdAt: practice.createdAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      practice: null,
      message: `Failed to get practice: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Create practice.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function createPractice(
  tenantId: string,
  data: { name: string; code: string; address?: string; phone?: string; email?: string; pcnId?: string },
  actorId: string
): Promise<{ supported: boolean; practice: PracticeInfo | null; message?: string }> {
  try {
    // Check if code already exists
    const existing = await prisma.practice.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return {
        supported: false,
        practice: null,
        message: `Practice with code ${data.code} already exists`,
      };
    }

    const practice = await prisma.practice.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        email: data.email,
      },
    });

    // Link to PCN if provided
    if (data.pcnId) {
      await prisma.practicePcn.create({
        data: {
          practiceId: practice.id,
          pcnId: data.pcnId,
        },
      });
    }

    // Reload with PCN link
    const practiceWithPcn = await prisma.practice.findUnique({
      where: { id: practice.id },
      include: {
        pcnLinks: {
          include: {
            pcn: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Audit log
    try {
      await auditEvent("healthcare.practice.created", {
        tenantId,
        practiceId: practice.id,
        code: practice.code,
        name: practice.name,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      practice: {
        id: practice.id,
        name: practice.name,
        code: practice.code,
        address: practice.address || undefined,
        phone: practice.phone || undefined,
        email: practice.email || undefined,
        pcnId: practiceWithPcn?.pcnLinks[0]?.pcnId,
        pcnName: practiceWithPcn?.pcnLinks[0]?.pcn.name,
        createdAt: practice.createdAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      practice: null,
      message: `Failed to create practice: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Update practice.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function updatePractice(
  tenantId: string,
  practiceId: string,
  data: { name?: string; code?: string; address?: string; phone?: string; email?: string; pcnId?: string },
  actorId: string
): Promise<{ supported: boolean; practice: PracticeInfo | null; message?: string }> {
  try {
    // Verify practice exists and belongs to tenant
    const existing = await prisma.practice.findFirst({
      where: {
        id: practiceId,
        tenantId,
      },
    });

    if (!existing) {
      return {
        supported: false,
        practice: null,
        message: "Practice not found",
      };
    }

    // Check code uniqueness if code is being changed
    if (data.code && data.code !== existing.code) {
      const codeExists = await prisma.practice.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        return {
          supported: false,
          practice: null,
          message: `Practice with code ${data.code} already exists`,
        };
      }
    }

    // Update practice
    const practice = await prisma.practice.update({
      where: { id: practiceId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
      },
    });

    // Update PCN link if provided
    if (data.pcnId !== undefined) {
      // Remove existing links
      await prisma.practicePcn.deleteMany({
        where: { practiceId },
      });

      // Add new link if pcnId is provided
      if (data.pcnId) {
        await prisma.practicePcn.create({
          data: {
            practiceId,
            pcnId: data.pcnId,
          },
        });
      }
    }

    // Reload with PCN link
    const practiceWithPcn = await prisma.practice.findUnique({
      where: { id: practice.id },
      include: {
        pcnLinks: {
          include: {
            pcn: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Audit log
    try {
      await auditEvent("healthcare.practice.updated", {
        tenantId,
        practiceId: practice.id,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      practice: {
        id: practice.id,
        name: practice.name,
        code: practice.code,
        address: practice.address || undefined,
        phone: practice.phone || undefined,
        email: practice.email || undefined,
        pcnId: practiceWithPcn?.pcnLinks[0]?.pcnId,
        pcnName: practiceWithPcn?.pcnLinks[0]?.pcn.name,
        createdAt: practice.createdAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      practice: null,
      message: `Failed to update practice: ${e?.message || "unknown"}`,
    };
  }
}
