import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { acceptRecommendation } from "@/server/planning/service";
import { captureError } from "@/server/observability/sentry";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:planning:admin");
    const { tenantId, userId } = await assertTenantScope();

    const body = await req.json();
    const { recommendationId } = body;

    if (!recommendationId) {
      return Response.json({ ok: false, error: "recommendationId required" }, { status: 400 });
    }

    const result = await acceptRecommendation(tenantId, recommendationId, userId);

    if (!result.supported) {
      return Response.json({ ok: false, error: result.reason || "Failed to accept recommendation" }, { status: 400 });
    }

    return Response.json({
      ok: true,
      documentId: result.documentId,
      documentType: result.documentType,
    });
  } catch (error: any) {
    captureError(error, { module: "planning", operation: "accept_recommendation" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

