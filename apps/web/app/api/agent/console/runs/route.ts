import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getAgentRunsForTenant } from "@/server/ai/agent/logs";
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
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;

    const result = await getAgentRunsForTenant(tenantId, limit);

    return Response.json({
      ok: true,
      supported: result.supported,
      runs: result.runs,
      reason: result.reason,
    });
  } catch (error: any) {
    captureError(error, { module: "agent", operation: "get_runs" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

