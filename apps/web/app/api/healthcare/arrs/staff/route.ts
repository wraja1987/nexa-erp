import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listHealthcareStaff, getArrsEligibleStaff } from "@/server/healthcare/arrs-locums";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:healthcare:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const arrsOnly = searchParams.get("arrsOnly") === "true";
    const result = arrsOnly ? await getArrsEligibleStaff(tenantId) : await listHealthcareStaff(tenantId);
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

