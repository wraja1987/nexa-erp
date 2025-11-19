import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getDownloadUrl } from "@/server/attachments/presign";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:attachments:view");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const { attachmentId } = body;

    if (!attachmentId) {
      return Response.json({ ok: false, error: "attachmentId required" }, { status: 400 });
    }

    const result = await getDownloadUrl({ tenantId, userId }, attachmentId);

    if (!result.supported) {
      if (result.message?.includes("not found")) {
        return Response.json({ ok: false, error: result.message }, { status: 404 });
      }
      return Response.json({ ok: false, error: result.message || "Not supported" }, { status: 501 });
    }

    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

