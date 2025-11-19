/**
 * Phase 14 — PCN Management
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

export type PcnInfo = {
  id: string;
  name: string;
  code: string;
  practiceCount?: number;
  createdAt?: Date;
};

export type PcnListResult = {
  supported: boolean;
  pcns: PcnInfo[];
  total?: number;
  message?: string;
};

export type PcnDetailResult = {
  supported: boolean;
  pcn: PcnInfo | null;
  message?: string;
};

export type PracticesForPcnResult = {
  supported: boolean;
  practices: Array<{ id: string; name: string; code?: string }>;
  message?: string;
};

/**
 * List PCNs for tenant.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listPcns(tenantId: string): Promise<PcnListResult> {
  try {
    const pcns = await prisma.pcn.findMany({
      where: { tenantId },
      include: {
        practices: {
          select: {
            practiceId: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const pcnInfos: PcnInfo[] = pcns.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      practiceCount: p.practices.length,
      createdAt: p.createdAt,
    }));

    return {
      supported: true,
      pcns: pcnInfos,
      total: pcnInfos.length,
    };
  } catch (e: any) {
    return {
      supported: false,
      pcns: [],
      message: `Failed to list PCNs: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Get PCN detail.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getPcn(tenantId: string, pcnId: string): Promise<PcnDetailResult> {
  try {
    const pcn = await prisma.pcn.findFirst({
      where: {
        id: pcnId,
        tenantId,
      },
      include: {
        practices: {
          select: {
            practiceId: true,
          },
        },
      },
    });

    if (!pcn) {
      return {
        supported: true,
        pcn: null,
        message: "PCN not found",
      };
    }

    return {
      supported: true,
      pcn: {
        id: pcn.id,
        name: pcn.name,
        code: pcn.code,
        practiceCount: pcn.practices.length,
        createdAt: pcn.createdAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      pcn: null,
      message: `Failed to get PCN: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * List practices for a PCN.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listPracticesForPcn(tenantId: string, pcnId: string): Promise<PracticesForPcnResult> {
  try {
    // Verify PCN exists and belongs to tenant
    const pcn = await prisma.pcn.findFirst({
      where: {
        id: pcnId,
        tenantId,
      },
    });

    if (!pcn) {
      return {
        supported: false,
        practices: [],
        message: "PCN not found",
      };
    }

    const practiceLinks = await prisma.practicePcn.findMany({
      where: { pcnId },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    const practices = practiceLinks.map((link) => ({
      id: link.practice.id,
      name: link.practice.name,
      code: link.practice.code,
    }));

    return {
      supported: true,
      practices,
    };
  } catch (e: any) {
    return {
      supported: false,
      practices: [],
      message: `Failed to list practices for PCN: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Create PCN.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function createPcn(
  tenantId: string,
  data: { name: string; code: string },
  actorId: string
): Promise<{ supported: boolean; pcn: PcnInfo | null; message?: string }> {
  try {
    // Check if code already exists
    const existing = await prisma.pcn.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return {
        supported: false,
        pcn: null,
        message: `PCN with code ${data.code} already exists`,
      };
    }

    const pcn = await prisma.pcn.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
      },
    });

    // Audit log
    try {
      await auditEvent("healthcare.pcn.created", {
        tenantId,
        pcnId: pcn.id,
        code: pcn.code,
        name: pcn.name,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      pcn: {
        id: pcn.id,
        name: pcn.name,
        code: pcn.code,
        practiceCount: 0,
        createdAt: pcn.createdAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      pcn: null,
      message: `Failed to create PCN: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Update PCN.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function updatePcn(
  tenantId: string,
  pcnId: string,
  data: { name?: string; code?: string },
  actorId: string
): Promise<{ supported: boolean; pcn: PcnInfo | null; message?: string }> {
  try {
    // Verify PCN exists and belongs to tenant
    const existing = await prisma.pcn.findFirst({
      where: {
        id: pcnId,
        tenantId,
      },
    });

    if (!existing) {
      return {
        supported: false,
        pcn: null,
        message: "PCN not found",
      };
    }

    // Check code uniqueness if code is being changed
    if (data.code && data.code !== existing.code) {
      const codeExists = await prisma.pcn.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        return {
          supported: false,
          pcn: null,
          message: `PCN with code ${data.code} already exists`,
        };
      }
    }

    const pcn = await prisma.pcn.update({
      where: { id: pcnId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
      },
    });

    // Get practice count
    const practiceCount = await prisma.practicePcn.count({
      where: { pcnId },
    });

    // Audit log
    try {
      await auditEvent("healthcare.pcn.updated", {
        tenantId,
        pcnId: pcn.id,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      pcn: {
        id: pcn.id,
        name: pcn.name,
        code: pcn.code,
        practiceCount,
        createdAt: pcn.createdAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      pcn: null,
      message: `Failed to update PCN: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Link practice to PCN.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function linkPracticeToPcn(
  tenantId: string,
  practiceId: string,
  pcnId: string,
  actorId: string
): Promise<{ supported: boolean; message?: string }> {
  try {
    // Verify practice exists and belongs to tenant
    const practice = await prisma.practice.findFirst({
      where: {
        id: practiceId,
        tenantId,
      },
    });

    if (!practice) {
      return {
        supported: false,
        message: "Practice not found",
      };
    }

    // Verify PCN exists and belongs to tenant
    const pcn = await prisma.pcn.findFirst({
      where: {
        id: pcnId,
        tenantId,
      },
    });

    if (!pcn) {
      return {
        supported: false,
        message: "PCN not found",
      };
    }

    // Create link (upsert to handle duplicates)
    await prisma.practicePcn.upsert({
      where: {
        practiceId_pcnId: {
          practiceId,
          pcnId,
        },
      },
      create: {
        practiceId,
        pcnId,
      },
      update: {},
    });

    // Audit log
    try {
      await auditEvent("healthcare.practice.pcn.linked", {
        tenantId,
        practiceId,
        pcnId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return { supported: true };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to link practice to PCN: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Unlink practice from PCN.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function unlinkPracticeFromPcn(
  tenantId: string,
  practiceId: string,
  pcnId: string,
  actorId: string
): Promise<{ supported: boolean; message?: string }> {
  try {
    // Verify practice exists and belongs to tenant
    const practice = await prisma.practice.findFirst({
      where: {
        id: practiceId,
        tenantId,
      },
    });

    if (!practice) {
      return {
        supported: false,
        message: "Practice not found",
      };
    }

    // Verify PCN exists and belongs to tenant
    const pcn = await prisma.pcn.findFirst({
      where: {
        id: pcnId,
        tenantId,
      },
    });

    if (!pcn) {
      return {
        supported: false,
        message: "PCN not found",
      };
    }

    // Delete link
    await prisma.practicePcn.deleteMany({
      where: {
        practiceId,
        pcnId,
      },
    });

    // Audit log
    try {
      await auditEvent("healthcare.practice.pcn.unlinked", {
        tenantId,
        practiceId,
        pcnId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return { supported: true };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to unlink practice from PCN: ${e?.message || "unknown"}`,
    };
  }
}
