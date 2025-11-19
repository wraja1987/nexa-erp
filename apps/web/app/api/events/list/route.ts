import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listOutboxEvents } from "@/server/events/outboxRepository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:super");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const since = searchParams.get("since") ? new Date(searchParams.get("since")!) : undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await listOutboxEvents({
      tenantId,
      type,
      status,
      since,
      limit,
      offset,
    });

    if (!result.supported) {
      return Response.json({ ok: false, error: result.reason || "Failed to list events" }, { status: 400 });
    }

    return Response.json({
      ok: true,
      data: {
        events: result.events,
        total: result.total,
      },
    });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}
