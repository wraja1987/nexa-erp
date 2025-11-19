import { requirePermissionServer } from "@/lib/auth/guards.server";

export async function GET() {
  await requirePermissionServer("ui:manufacturing:view");
  return Response.json({ ok: false, error: "not_implemented" }, { status: 501 });
}


