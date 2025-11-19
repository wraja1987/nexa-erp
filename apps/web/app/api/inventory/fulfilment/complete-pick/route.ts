import { requirePermissionServer } from "@/lib/auth/guards.server";

export async function POST() {
  await requirePermissionServer("inventory:manage");
  return Response.json({ ok: false, error: "not_implemented" }, { status: 501 });
}


