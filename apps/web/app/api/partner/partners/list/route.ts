import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { listPartnersForSuperAdmin } from "@/server/partner/partners";

export async function GET(req: NextRequest) {
  try {
    // Super-admin only
    await requirePermissionServer("ui:admin:super");
    const partnersResult = await listPartnersForSuperAdmin();
    return Response.json({ ok: true, data: partnersResult });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

