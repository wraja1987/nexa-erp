import { requirePermissionServer } from "@/lib/auth/guards.server";
import { closeSession } from "@/server/pos/sessions";

export async function POST() {
  await requirePermissionServer("ui:pos:edit");
  const res = await closeSession();
  return Response.json({ ok: false, error: res.message }, { status: res.code || 501 });
}


