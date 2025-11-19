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

    if (!entityType) {
      return Response.json({ ok: false, error: "entityType required" }, { status: 400 });
    }

    // Get workflow definition
    const { supported, def, reason } = await getWorkflowDefinition(entityType, tenantId);

    if (!supported || !def) {
      return Response.json({
        ok: true,
        supported: false,
        reason: reason || "No workflow definition found",
      });
    }

    // If entityId provided, build context and get available actions
    let context = null;
    let availableActions: Array<{ action: string; label: string }> = [];

    if (entityId) {
      try {
        // Use role from requirePermissionServer call above
        const actorRole = perm.role;

        context = await buildWorkflowContext(entityType, entityId, tenantId, userId, actorRole);
        availableActions = getAvailableActions(def, context.currentState, context).map((a) => ({
          action: a.action,
          label: a.label,
        }));
      } catch (error: any) {
        // If context build fails, return definition without context
        console.warn(`[Workflow] Failed to build context:`, error);
      }
    }

    return Response.json({
      ok: true,
      supported: true,
      definition: {
        entityType: def.entityType,
        states: def.states,
        transitions: def.transitions,
        initialState: def.initialState,
      },
      context: context
        ? {
            currentState: context.currentState,
            amount: context.amount,
            actorRole: context.actorRole,
          }
        : null,
      availableActions,
    });
  } catch (error: any) {
    captureError(error, { module: "workflow", operation: "get_definition" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

