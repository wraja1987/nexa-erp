import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getTenantUsageMetrics } from "@/server/admin/superadminUsage";
import { captureError } from "@/server/observability/sentry";

type Props = {
  params: { tenantId: string };
};

export async function GET(req: NextRequest, { params }: Props) {
  try {
    await requirePermissionServer("ui:superadmin:portal");
    const metrics = await getTenantUsageMetrics(params.tenantId);

    return Response.json({
      ok: true,
      metrics,
    });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "get_tenant_usage" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

