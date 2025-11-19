import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { listWorkflowHistory } from "@/server/workflow/history";
import { captureError } from "@/server/observability/sentry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:workflow:view");
    const { tenantId } = await assertTenantScope();

    const searchParams = req.nextUrl.searchParams;
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return Response.json({ ok: false, error: "entityType and entityId required" }, { status: 400 });
    }

    // Get workflow history
    const result = await listWorkflowHistory(entityType, entityId, tenantId);

    if (!result.supported) {
      return Response.json({
        ok: true,
        supported: false,
        reason: result.reason || "Failed to get workflow history",
        entries: [],
      });
    }

    return Response.json({
      ok: true,
      supported: true,
      entries: result.entries,
    });
  } catch (error: any) {
    captureError(error, { module: "workflow", operation: "get_history" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}
