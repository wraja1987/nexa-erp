import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope } from "@/lib/finance/entity";
import { recordMtdSubmissionResult } from "@/server/tax/hmrc-mtd";
import { captureError } from "@/server/observability/sentry";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:tax:edit");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);

    if (!body.vatReturnId || !body.submissionId || !body.status) {
      return Response.json({ ok: false, error: "vatReturnId, submissionId, and status are required" }, { status: 400 });
    }

    const result = await recordMtdSubmissionResult(
      scope,
      body.vatReturnId,
      body.submissionId,
      body.status,
      body.response,
      userId
    );

    return Response.json({ ok: true, data: result.data });
  } catch (error: any) {
    captureError(error, { module: "tax", operation: "record_mtd_submission" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}
