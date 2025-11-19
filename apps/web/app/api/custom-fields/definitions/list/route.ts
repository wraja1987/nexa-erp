import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { listDefinitions } from "@/server/customFields/definitionsService";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:customfields:view");
    const { tenantId } = await assertTenantScope();

    const searchParams = req.nextUrl.searchParams;
    const entityType = searchParams.get("entityType");

    if (!entityType) {
      return Response.json({ ok: false, error: "entityType required" }, { status: 400 });
    }

    const result = await listDefinitions(tenantId, entityType);

    return Response.json({
      ok: true,
      supported: result.supported,
      definitions: result.definitions,
      reason: result.reason,
    });
  } catch (error: any) {
    captureError(error, { module: "customFields", operation: "list_definitions" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

