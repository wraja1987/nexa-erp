import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const bodySchema = z.object({ token: z.string().min(10), password: z.string().min(8) });

export async function POST(req: Request) {
  const { token, password } = bodySchema.parse(await req.json());
  const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!rec || rec.used || rec.expiresAt < new Date()) return NextResponse.json({ ok: true });

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: rec.userId }, data: { passwordHash: hash } });
  await prisma.passwordResetToken.update({ where: { token }, data: { used: true } });
  return NextResponse.json({ ok: true });
}













