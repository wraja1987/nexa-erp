import { requirePermissionServer } from "@/lib/auth/guards.server";

export async function POST() {
  await requirePermissionServer("ui:sales:edit");
  return Response.json({ ok: false, error: "not_implemented: schema gap: no reservation fields" }, { status: 501 });
}


