import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getAgentStepsForRun } from "@/server/ai/agent/logs";
import { isAgentEnabledForTenant } from "@/server/ai/config";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:ai:admin");
    const { tenantId } = await assertTenantScope();

    // Check if agent is enabled
    const enabled = await isAgentEnabledForTenant(tenantId);
    if (!enabled) {
      return Response.json(
        {
          ok: false,
          error: "Agent features are disabled. Set AGENT_ENABLED=true to enable.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const runId = searchParams.get("runId");

    if (!runId) {
      return Response.json({ ok: false, error: "runId is required" }, { status: 400 });
    }

    const result = await getAgentStepsForRun(runId);

    return Response.json({
      ok: true,
      supported: result.supported,
      steps: result.steps,
      reason: result.reason,
    });
  } catch (error: any) {
    captureError(error, { module: "agent", operation: "get_steps" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

