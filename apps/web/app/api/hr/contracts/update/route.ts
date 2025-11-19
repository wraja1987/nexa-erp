import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("hr:employees:write");
    return Response.json({ ok: false, error: "not_supported" }, { status: 501 });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


