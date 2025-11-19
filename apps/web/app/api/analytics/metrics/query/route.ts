import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope } from "@/lib/finance/entity";
import { queryMetrics } from "@/server/analytics/metrics";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:analytics:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const scope = await resolveLegalEntityScope(tenantId);

    const name = searchParams.get("name") || undefined;
    const start = searchParams.get("start") ? new Date(searchParams.get("start")!) : undefined;
    const end = searchParams.get("end") ? new Date(searchParams.get("end")!) : undefined;

    const result = await queryMetrics(scope, { name, start, end });
    return Response.json({ ok: true, data: result });
  } catch (error: any) {
    captureError(error, { module: "analytics", operation: "query_metrics" });
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: 500 });
  }
}
