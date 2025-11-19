import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getRolePermissionMatrix } from "@/server/admin/rbacView";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:rbac");
    const matrix = getRolePermissionMatrix();

    return Response.json({
      ok: true,
      matrix,
    });
  } catch (error: any) {
    captureError(error, { module: "admin", operation: "get_rbac_matrix" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

