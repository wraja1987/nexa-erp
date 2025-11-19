import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { listTenantsWithSummary } from "@/server/admin/superadminTenants";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:superadmin:portal");
    const tenants = await listTenantsWithSummary();

    return Response.json({
      ok: true,
      tenants,
    });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "list_tenants" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

