import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().min(1).default("USER"),
  tenantId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // Dev-only safety: do not expose in production
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  try {
    const raw = await req.json().catch(async () => {
      const t = await req.text();
      return JSON.parse(t || "{}");
    });
    const body = Body.parse(raw);
    const email = body.email.toLowerCase();
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password_hash: passwordHash as any,
        role: body.role as any,
        active: true,
        tenantId: body.tenantId,
      } as any,
      create: {
        email,
        password_hash: passwordHash as any,
        role: body.role as any,
        active: true,
        tenantId: body.tenantId,
      } as any,
      select: { id: true, email: true, role: true, tenantId: true, active: true },
    });
    return Response.json({ ok: true, user });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


