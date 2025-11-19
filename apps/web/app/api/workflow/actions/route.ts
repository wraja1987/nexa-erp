import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getWorkflowDefinition } from "@/server/workflow/registry";
import { buildWorkflowContext } from "@/server/workflow/context";
import { getAvailableActions } from "@/server/workflow/engine";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    const perm = await requirePermissionServer("ui:workflow:view");
    const { tenantId, userId } = await assertTenantScope();

    const searchParams = req.nextUrl.searchParams;
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return Response.json({ ok: false, error: "entityType and entityId required" }, { status: 400 });
    }

    // Get workflow definition
    const { supported, def, reason } = await getWorkflowDefinition(entityType, tenantId);

    if (!supported || !def) {
      return Response.json({
        ok: true,
        supported: false,
        reason: reason || "No workflow definition found",
        actions: [],
      });
    }

    // Build context
    try {
      // Use role from requirePermissionServer call above
      const actorRole = perm.role;

      const context = await buildWorkflowContext(entityType, entityId, tenantId, userId, actorRole);
      const actions = getAvailableActions(def, context.currentState, context);

      return Response.json({
        ok: true,
        supported: true,
        currentState: context.currentState,
        actions: actions.map((a) => ({
          action: a.action,
          label: a.label,
        })),
      });
    } catch (error: any) {
      captureError(error, { module: "workflow", operation: "get_actions" });
      return Response.json({
        ok: false,
        error: error?.message || "Failed to get available actions",
      }, { status: 400 });
    }
  } catch (error: any) {
    captureError(error, { module: "workflow", operation: "get_actions" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

