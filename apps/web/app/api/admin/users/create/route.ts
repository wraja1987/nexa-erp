import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { auditEvent } from "@/lib/observability/audit";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "VIEWER"]).default("STAFF"),
  tenantId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Require ADMIN or higher
    const { userId: actorId, role: actorRole } = await requirePermissionServer("admin:role_change");
    const raw = await req.json().catch(async () => {
      const t = await req.text();
      return JSON.parse(t || "{}");
    });
    const body = Body.parse(raw);
    const email = body.email.toLowerCase();
    const passwordHash = await bcrypt.hash(body.password, 10);
    const tenantId = body.tenantId || "default";

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password_hash: passwordHash as any,
        role: body.role as any,
        active: true,
        tenantId,
      } as any,
      create: {
        email,
        password_hash: passwordHash as any,
        role: body.role as any,
        active: true,
        tenantId,
      } as any,
      select: { id: true, email: true, role: true, tenantId: true, active: true },
    });

    await auditEvent("admin.user.created", { tenantId, actorId, target: user.id, email: user.email, role: user.role });
    return Response.json({ ok: true, user });
  } catch (e: any) {
    const msg = String(e?.message || "bad_request");
    const code = e?.code || (msg === "Forbidden" ? 403 : 400);
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    return Response.json({ ok: false, error: msg }, { status: code });
  }
}

export function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}


