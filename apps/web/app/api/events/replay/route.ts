import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { processOutboxBatch, replayOutboxEvents } from "@/server/events/consumerRunner";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:super");
    const { tenantId } = await getSessionContext();
    const body = await req.json();
    const { limit, since, type, ids } = body;

    let result;

    // If specific IDs provided, replay those
    if (ids && Array.isArray(ids) && ids.length > 0) {
      result = await replayOutboxEvents(ids);
    } else {
      // Otherwise, process a batch with filters
      result = await processOutboxBatch({
        limit: limit || 100,
        type,
        tenantId,
        since: since ? new Date(since) : undefined,
      });
    }

    if (!result.supported) {
      return Response.json({ ok: false, error: result.reason || "Not supported" }, { status: 400 });
    }

    return Response.json({
      ok: true,
      data: {
        processed: result.processed,
        failed: result.failed,
        remaining: result.remaining,
      },
    });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}
