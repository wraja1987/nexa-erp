import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const bodySchema = z.object({ token: z.string().min(10), password: z.string().min(8) });

export async function POST(req: Request) {
  const { token, password } = bodySchema.parse(await req.json());
  const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!rec || rec.used || rec.expiresAt < new Date()) return NextResponse.json({ error: 'invalid_token' }, { status: 400 });

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: rec.userId }, data: { passwordHash: hash } });
  // Invalidate this and all other tokens for this user
  await prisma.passwordResetToken.updateMany({ where: { userId: rec.userId }, data: { used: true } } as any);

  // Proactively clear auth cookies in this browser (best-effort)
  const headers = new Headers();
  const base = process.env.NEXTAUTH_URL || '';
  const cookieAttrs = `Path=/; HttpOnly; Max-Age=0${base.startsWith('https://') ? '; Secure; SameSite=Lax' : ''}`;
  headers.append('Set-Cookie', `next-auth.session-token=; ${cookieAttrs}`);
  headers.append('Set-Cookie', `__Secure-next-auth.session-token=; ${cookieAttrs}`);
  return NextResponse.json({ ok: true }, { headers });
}













