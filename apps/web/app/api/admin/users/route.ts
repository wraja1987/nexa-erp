import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { listUsersForTenant, createTenantUser } from "@/server/admin/userManagement";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:users");
    const { tenantId, userId } = await assertTenantScope();
    const users = await listUsersForTenant(tenantId);

    return Response.json({
      ok: true,
      users,
    });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "list_users" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:users");
    const { tenantId, userId } = await assertTenantScope();
    const body = await req.json();

    const result = await createTenantUser(tenantId, body, userId);

    if (!result.supported) {
      return Response.json({ ok: false, error: result.reason }, { status: 400 });
    }

    return Response.json({
      ok: true,
      user: result.user,
    });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "create_user" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

