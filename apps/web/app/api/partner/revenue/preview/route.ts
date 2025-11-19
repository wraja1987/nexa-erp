import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { calculateRevenueShare, previewRevenueShareForAllTenants } from "@/server/partner/revenue";

export async function GET(req: NextRequest) {
  try {
    // Super-admin only
    await requirePermissionServer("ui:admin:super");
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId") || "all";
    const sharePercentage = Number(searchParams.get("sharePercentage") || "20");

    let result;
    if (partnerId === "all") {
      result = await previewRevenueShareForAllTenants(sharePercentage);
    } else {
      result = await calculateRevenueShare(partnerId, sharePercentage);
    }

    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

