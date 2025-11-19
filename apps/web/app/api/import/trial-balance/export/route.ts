import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { exportTrialBalanceCsv } from "@/server/imports/openingBalances";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:finance_reports:view");
    const { tenantId, userId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const asOfStr = searchParams.get("asOf");
    const asOf = asOfStr ? new Date(asOfStr) : undefined;

    const result = await exportTrialBalanceCsv({ tenantId, userId }, asOf);

    if (!result.supported) {
      return Response.json({ ok: false, error: result.message || "Not supported" }, { status: 501 });
    }

    return new Response(result.csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="trial-balance-export.csv"',
      },
    });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

