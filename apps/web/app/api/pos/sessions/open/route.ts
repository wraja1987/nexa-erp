import { requirePermissionServer } from "@/lib/auth/guards.server";
import { openSession } from "@/server/pos/sessions";

export async function POST() {
  await requirePermissionServer("ui:pos:edit");
  const res = await openSession();
  return Response.json({ ok: false, error: res.message }, { status: res.code || 501 });
}


