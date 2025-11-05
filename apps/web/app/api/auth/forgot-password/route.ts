import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { addMinutes } from "date-fns";
import nodemailer from "nodemailer";
import { getLimiter, keyFromReq } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const RESET_EXPIRY_MINUTES = 30;

async function readEmail(req: Request): Promise<string | null> {
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = await req.json();
      return typeof body?.email === "string" ? String(body.email).trim().toLowerCase() : null;
    }
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await req.formData();
      const email = form.get("email");
      return typeof email === "string" ? email.trim().toLowerCase() : null;
    }
  } catch (_) {
    // ignore parse errors and fall through
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const limiter = getLimiter('forgot_password', 10, 60_000); // 10/min per IP
    const k = keyFromReq(req);
    if (!limiter.allow(k)) return NextResponse.json({ ok: true }, { status: 429 });
    const email = await readEmail(req);
    if (!email) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });

    // Always return 200 to avoid user enumeration
    if (!user) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = addMinutes(new Date(), RESET_EXPIRY_MINUTES);

    // Invalidate any existing tokens for this user to enforce rotation on request
    await prisma.passwordResetToken.updateMany({ where: { userId: user.id, used: false }, data: { used: true } } as any);
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt, used: false } } as any);

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://app.nexaai.co.uk";
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT || 587);
      const userSmtp = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
      const from = process.env.EMAIL_FROM || "info@nexaai.co.uk";

      if (host && userSmtp && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: false,
          auth: { user: userSmtp, pass },
        });
        await transporter.sendMail({
          from,
          to: user.email,
          subject: "Reset your Nexa ERP password",
          text: `Use the link to reset your password: ${resetUrl}`,
          html: `<p>Use the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });
      } else {
        console.info("[forgot-password] SMTP not configured; skipping send");
      }
    } catch (err) {
      console.warn("[forgot-password] email send failed:", err);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[forgot-password] unexpected error:", err);
    // Still return 200 to avoid leaking information
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
