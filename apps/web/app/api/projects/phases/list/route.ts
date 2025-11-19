import { requirePermissionServer } from "@/lib/auth/guards.server";

export async function GET() {
  await requirePermissionServer("ui:projects:view");
  return Response.json({ ok: true, data: [] });
}


