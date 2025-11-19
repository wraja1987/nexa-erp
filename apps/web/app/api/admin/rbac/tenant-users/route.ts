import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getTenantUserRoleView } from "@/server/admin/rbacView";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:rbac");
    const { tenantId } = await assertTenantScope();
    const views = await getTenantUserRoleView(tenantId);

    return Response.json({
      ok: true,
      views,
    });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "get_tenant_user_roles" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

