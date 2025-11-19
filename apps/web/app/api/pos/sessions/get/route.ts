import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getSession } from "@/server/pos/sessions";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:pos:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ ok: false, error: "missing_id" }, { status: 400 });
  const data = await getSession({ tenantId }, id);
  if (!data) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  return Response.json({ ok: true, data });
}


