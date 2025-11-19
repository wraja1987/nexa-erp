import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:super");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const targetTenantId = body.tenantId || tenantId;
    const { region } = body;

    if (!region || !["UK", "EU", "GCC", "US"].includes(region)) {
      return Response.json({ ok: false, error: "Invalid region. Must be UK, EU, GCC, or US" }, { status: 400 });
    }

    // Update TenantConfig.config.region
    const config = await prisma.tenantConfig.upsert({
      where: { tenantId: targetTenantId },
      update: {
        config: {
          ...((await prisma.tenantConfig.findUnique({ where: { tenantId: targetTenantId }, select: { config: true } }))?.config as any || {}),
          region,
        } as any,
      },
      create: {
        tenantId: targetTenantId,
        config: {
          region,
        } as any,
      },
    });

    // Audit log
    try {
      await auditEvent("security.residency.region.updated", {
        tenantId: targetTenantId,
        region,
        actorId: userId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return Response.json({
      ok: true,
      data: {
        tenantId: targetTenantId,
        region,
      },
    });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

