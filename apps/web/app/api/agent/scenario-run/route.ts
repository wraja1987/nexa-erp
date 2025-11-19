import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { runReadOnlyScenario } from "@/server/ai/agent/scenarioRunner";
import { captureError } from "@/server/observability/sentry";

export async function POST(req: NextRequest) {
  try {
    // Internal/admin only
    await requirePermissionServer("ui:ai:admin");
    const { tenantId, userId } = await assertTenantScope();

    const body = await req.json();
    const { goal, modules } = body;

    if (!goal || typeof goal !== "string") {
      return Response.json({ ok: false, error: "goal is required" }, { status: 400 });
    }

    const result = await runReadOnlyScenario({
      tenantId,
      userId,
      goal,
      modules: Array.isArray(modules) ? modules : undefined,
    });

    return Response.json({
      ok: result.ok,
      result,
    });
  } catch (error: any) {
    captureError(error, { module: "agent", operation: "run_scenario" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

