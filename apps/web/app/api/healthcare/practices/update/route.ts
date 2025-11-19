import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { updatePractice } from "@/server/healthcare/practices";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:healthcare:admin");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const { practiceId, ...data } = body;
    if (!practiceId) {
      return Response.json({ ok: false, error: "practiceId required" }, { status: 400 });
    }
    const result = await updatePractice(tenantId, practiceId, data, userId);
    if (!result.supported) {
      return Response.json({ ok: false, error: result.message || "Not supported" }, { status: 400 });
    }
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

