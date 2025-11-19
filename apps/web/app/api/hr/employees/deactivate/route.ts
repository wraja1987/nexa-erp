import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";

const Body = z.object({
  id: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("hr:employees:write");
    // Schema gap: Employee has no active/status field — deactivation unsupported
    return Response.json({ ok: false, error: "not_supported" }, { status: 501 });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


