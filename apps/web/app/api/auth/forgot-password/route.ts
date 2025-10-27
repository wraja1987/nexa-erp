import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
// Dynamic import inside handler to avoid cold start issues on edge

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  let email: string;
  try {
    ({ email } = bodySchema.parse(await req.json()));
  } catch {
    return NextResponse.json({ ok: true });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user?.active) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://app.nexaai.co.uk";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    // Prefer EMAIL_SERVER URL if provided (e.g. smtps://user:pass@host:465)
    const nodemailer = (await import("nodemailer")).default;
    let transporter: any;
    if (process.env.EMAIL_SERVER) {
      transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = Number(process.env.SMTP_PORT ?? 587);
      const secure = String(process.env.SMTP_SECURE ?? "").toLowerCase() === "true" || port === 465;
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: { user: String(process.env.SMTP_USER), pass: String(process.env.SMTP_PASS) },
      });
    } else {
      // Skip send if SMTP not configured
      return NextResponse.json({ ok: true, skipped: true, resetUrl });
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? "Nexa ERP <no-reply@nexaai.co.uk>",
      to: user.email,
      subject: "Reset your Nexa ERP password",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 30 minutes.</p>`
    });
  } catch {
    // Do not fail: return 200 with skipped flag
    return NextResponse.json({ ok: true, skipped: true, resetUrl });
  }
  return NextResponse.json({ ok: true, skipped: false });
  } catch {
    return NextResponse.json({ ok: true, skipped: true });
  }
}


