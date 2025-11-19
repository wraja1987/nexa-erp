import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getTenantDetail, suspendTenant, activateTenant } from "@/server/admin/superadminTenants";
import { captureError } from "@/server/observability/sentry";

type Props = {
  params: { tenantId: string };
};

export async function GET(req: NextRequest, { params }: Props) {
  try {
    await requirePermissionServer("ui:superadmin:portal");
    const detail = await getTenantDetail(params.tenantId);

    if (!detail) {
      return Response.json({ ok: false, error: "Tenant not found" }, { status: 404 });
    }

    return Response.json({
      ok: true,
      tenant: detail,
    });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "get_tenant_detail" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    await requirePermissionServer("ui:superadmin:portal");
    const { userId } = await getSessionContext();
    const body = await req.json();
    const action = body.action; // "suspend" or "activate"

    if (action === "suspend") {
      const result = await suspendTenant(params.tenantId, userId);
      if (!result.supported) {
        return Response.json({ ok: false, error: result.reason }, { status: 400 });
      }
      return Response.json({ ok: true, supported: true });
    } else if (action === "activate") {
      const result = await activateTenant(params.tenantId, userId);
      if (!result.supported) {
        return Response.json({ ok: false, error: result.reason }, { status: 400 });
      }
      return Response.json({ ok: true, supported: true });
    }

    return Response.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "tenant_action" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

