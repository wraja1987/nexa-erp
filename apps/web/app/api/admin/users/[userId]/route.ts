import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import {
  updateTenantUserRoles,
  deactivateTenantUser,
  reactivateTenantUser,
  triggerPasswordReset,
} from "@/server/admin/userManagement";
import { captureError } from "@/server/observability/sentry";

type Props = {
  params: { userId: string };
};

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    await requirePermissionServer("ui:admin:users");
    const { tenantId, userId } = await assertTenantScope();
    const body = await req.json();

    if (body.action === "updateRole" && body.role) {
      const result = await updateTenantUserRoles(tenantId, params.userId, body.role, userId);
      if (!result.supported) {
        return Response.json({ ok: false, error: result.reason }, { status: 400 });
      }
      return Response.json({ ok: true, user: result.user });
    } else if (body.action === "deactivate") {
      const result = await deactivateTenantUser(tenantId, params.userId, userId);
      if (!result.supported) {
        return Response.json({ ok: false, error: result.reason }, { status: 400 });
      }
      return Response.json({ ok: true });
    } else if (body.action === "reactivate") {
      const result = await reactivateTenantUser(tenantId, params.userId, userId);
      if (!result.supported) {
        return Response.json({ ok: false, error: result.reason }, { status: 400 });
      }
      return Response.json({ ok: true });
    } else if (body.action === "triggerPasswordReset") {
      const result = await triggerPasswordReset(tenantId, params.userId, userId);
      if (!result.supported) {
        return Response.json({ ok: false, error: result.reason }, { status: 400 });
      }
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "update_user" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

