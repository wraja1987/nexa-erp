import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { exportCoaCsv } from "@/server/imports/coa";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:manage");
    const { tenantId, userId } = await getSessionContext();
    const result = await exportCoaCsv({ tenantId, userId });

    if (!result.supported) {
      return Response.json({ ok: false, error: result.message || "Not supported" }, { status: 501 });
    }

    return new Response(result.csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="coa-export.csv"',
      },
    });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

