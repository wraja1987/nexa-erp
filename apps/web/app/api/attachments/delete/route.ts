import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { markAttachmentDeleted } from "@/server/attachments/service";
import { deleteAttachmentFromS3 } from "@/server/attachments/delete";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:attachments:edit");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const { attachmentId, reason, hardDelete } = body;

    if (!attachmentId) {
      return Response.json({ ok: false, error: "attachmentId required" }, { status: 400 });
    }

    // Soft delete database record
    const result = await markAttachmentDeleted({ tenantId, userId }, attachmentId, reason);

    if (!result.supported) {
      return Response.json({ ok: false, error: result.message || "Not supported" }, { status: 501 });
    }

    // If hardDelete=true, also delete from S3
    if (hardDelete === true) {
      const s3Result = await deleteAttachmentFromS3({ tenantId, userId }, attachmentId);
      if (!s3Result.deleted && s3Result.supported) {
        console.warn(`[Attachments] Failed to delete from S3: ${s3Result.message}`);
        // Continue anyway - DB record is soft-deleted
      }
    }

    return Response.json({ ok: true, data: { success: true, hardDelete: hardDelete === true } });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

