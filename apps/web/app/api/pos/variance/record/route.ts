import { requirePermissionServer } from "@/lib/auth/guards.server";
import { recordVariance } from "@/server/pos/variance";

export async function POST() {
  await requirePermissionServer("ui:pos:edit");
  const res = await recordVariance();
  return Response.json({ ok: false, error: res.message }, { status: res.code || 501 });
}


