import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getValuesForEntity } from "@/server/customFields/valuesService";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:customfields:view");
    const { tenantId } = await assertTenantScope();

    const searchParams = req.nextUrl.searchParams;
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return Response.json({ ok: false, error: "entityType and entityId required" }, { status: 400 });
    }

    const result = await getValuesForEntity(tenantId, entityType, entityId);

    return Response.json({
      ok: true,
      supported: result.supported,
      values: result.values,
      reason: result.reason,
    });
  } catch (error: any) {
    captureError(error, { module: "customFields", operation: "get_values" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

