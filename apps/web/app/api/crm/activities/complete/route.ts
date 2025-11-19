import { requirePermissionServer } from "@/lib/auth/guards.server";

export async function POST() {
  await requirePermissionServer("ui:crm:edit");
  return Response.json({ ok: false, error: "not_implemented" }, { status: 501 });
}


