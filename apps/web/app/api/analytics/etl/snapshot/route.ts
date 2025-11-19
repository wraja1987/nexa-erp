import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope } from "@/lib/finance/entity";
import { runDailySnapshot, runMonthlySnapshot, runModuleSnapshot, getSnapshots } from "@/server/analytics/etl";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:analytics:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const scope = await resolveLegalEntityScope(tenantId);

    const type = searchParams.get("type") || "daily";
    const module = searchParams.get("module") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    if (type === "list") {
      const result = await getSnapshots(scope, module, limit);
      return Response.json({ ok: true, data: result });
    }

    let result;
    if (type === "daily") {
      result = await runDailySnapshot(scope);
    } else if (type === "monthly") {
      result = await runMonthlySnapshot(scope);
    } else if (type === "module" && module) {
      result = await runModuleSnapshot(scope, module);
    } else {
      return Response.json({ ok: false, error: "Invalid type or missing module" }, { status: 400 });
    }

    return Response.json({ ok: true, data: result });
  } catch (error: any) {
    captureError(error, { module: "analytics", operation: "run_snapshot" });
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: 500 });
  }
}
