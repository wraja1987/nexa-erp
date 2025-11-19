import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getNetRequirementsPlan } from "@/server/planning/service";
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
    const itemId = searchParams.get("itemId") || undefined;
    const warehouseId = searchParams.get("warehouseId") || undefined;
    const locationId = searchParams.get("locationId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;

    const result = await getNetRequirementsPlan(tenantId, {
      horizonMonths,
      bucketSize,
      itemId,
      warehouseId,
      locationId,
      startDate,
    });

    if (!result.supported) {
      return Response.json(
        { ok: false, supported: false, error: result.reason || "Net requirements planning not supported" },
        { status: 501 }
      );
    }

    return Response.json({
      ok: true,
      supported: true,
      requirements: result.requirements,
    });
  } catch (error: any) {
    captureError(error, { module: "planning", operation: "get_net_requirements" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

