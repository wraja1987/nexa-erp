import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getUploadUrl } from "@/server/attachments/presign";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:attachments:edit");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const { entityType, entityId, filename, mimeType, size } = body;

    if (!entityType || !entityId || !filename || !mimeType || typeof size !== "number") {
      return Response.json(
        { ok: false, error: "entityType, entityId, filename, mimeType, and size (number) required" },
        { status: 400 }
      );
    }

    const result = await getUploadUrl(
      { tenantId, userId },
      { entityType, entityId },
      filename,
      mimeType,
      size
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

