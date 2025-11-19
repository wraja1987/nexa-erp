import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { buildClaimsPreview } from "@/server/healthcare/claims";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:healthcare:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM
    const practiceId = searchParams.get("practiceId") || undefined;
    const result = await buildClaimsPreview(tenantId, period, practiceId);
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

