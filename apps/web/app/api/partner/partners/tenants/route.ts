import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { listTenantsForPartner } from "@/server/partner/partners";

export async function GET(req: NextRequest) {
  try {
    // Super-admin only
    await requirePermissionServer("ui:admin:super");
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");
    if (!partnerId) {
      return Response.json({ ok: false, error: "partnerId required" }, { status: 400 });
    }
    const result = await listTenantsForPartner(partnerId);
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

