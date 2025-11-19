import { requirePermissionServer } from "@/lib/auth/guards.server";

export async function POST() {
  await requirePermissionServer("ui:manufacturing:edit");
  return Response.json({ ok: false, error: "not_implemented" }, { status: 501 });
}


