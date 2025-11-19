import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getCapacityView } from "@/server/planning/service";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:planning:view");
    const { tenantId } = await assertTenantScope();

    const searchParams = req.nextUrl.searchParams;
    const horizonMonths = searchParams.get("horizonMonths")
      ? parseInt(searchParams.get("horizonMonths")!, 10)
      : undefined;
    const bucketSize = (searchParams.get("bucket") as "week" | "month") || undefined;
    const resourceCode = searchParams.get("resourceCode") || undefined;
    const startDate = searchParams.get("startDate") || undefined;

    const result = await getCapacityView(tenantId, {
      horizonMonths,
      bucketSize,
      resourceCode,
      startDate,
    });

    if (!result.supported) {
      return Response.json(
        { ok: false, supported: false, error: result.reason || "Capacity view not supported" },
        { status: 501 }
      );
    }

    return Response.json({
      ok: true,
      supported: true,
      views: result.views,
    });
  } catch (error: any) {
    captureError(error, { module: "planning", operation: "get_capacity" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

