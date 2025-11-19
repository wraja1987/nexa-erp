import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listRotas } from "@/server/healthcare/rota";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:healthcare:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const filters: any = {};
    if (searchParams.get("practiceId")) filters.practiceId = searchParams.get("practiceId");
    if (searchParams.get("startDate")) filters.startDate = new Date(searchParams.get("startDate")!);
    if (searchParams.get("endDate")) filters.endDate = new Date(searchParams.get("endDate")!);
    const result = await listRotas(tenantId, Object.keys(filters).length > 0 ? filters : undefined);
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

