import { requirePermissionServer } from "@/lib/auth/guards.server";
import { createPromotion } from "@/server/pos/promotions";

export async function POST() {
  await requirePermissionServer("ui:pos:edit");
  const res = await createPromotion();
  return Response.json({ ok: false, error: res.message }, { status: res.code || 501 });
}


