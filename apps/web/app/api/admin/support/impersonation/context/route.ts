import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { prisma } from "@/lib/prisma";
import { buildSupportContext } from "@/server/admin/supportImpersonation";
import { captureError } from "@/server/observability/sentry";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { SuperadminSupportViewOpened } from "@/server/events/types";
import { incrementCounter } from "@/server/observability/metrics";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:superadmin:portal");
    const { userId } = await getSessionContext();
    const body = await req.json();

    const { tenantId: targetTenantId, userId: targetUserId } = body;

    if (!targetTenantId || !targetUserId) {
      return Response.json({ ok: false, error: "tenantId and userId are required" }, { status: 400 });
    }

    // Fetch target user
    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, tenantId: targetTenantId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return Response.json({ ok: false, error: "Target user not found" }, { status: 404 });
    }

    // Build support context
    const context = buildSupportContext(userId, targetTenantId, targetUserId, targetUser.role);

    // Publish event
    try {
      const event: SuperadminSupportViewOpened = {
        id: newEventId(),
        tenantId: targetTenantId,
        type: "superadmin.supportview.opened",
        occurredAt: nowIso(),
        source: "admin.supportImpersonation",
        version: 1,
        payload: {
          targetTenantId,
          targetUserId,
          superAdminUserId: userId,
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[Support] Failed to publish supportview.opened event:`, error);
    }

    // Record metrics
    incrementCounter("superadmin_support_sessions_total", {
      tenantId: targetTenantId,
      result: "success",
    });

    return Response.json({
      ok: true,
      context,
    });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "build_support_context" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

