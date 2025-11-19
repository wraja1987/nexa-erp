import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listAttachmentsForTarget } from "@/server/attachments/service";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:attachments:view");
    const { tenantId, userId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return Response.json({ ok: false, error: "entityType and entityId required" }, { status: 400 });
    }

    const result = await listAttachmentsForTarget(
      { tenantId, userId },
      { entityType, entityId }
    );

    if (!result.supported) {
      return Response.json({ ok: false, error: result.message || "Not supported" }, { status: 501 });
    }

    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

