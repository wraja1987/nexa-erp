import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const result: { ok: boolean; checks: Record<string, boolean>; [k: string]: unknown } = {
    ok: true,
    checks: {},
  };

  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    result.checks.db = true;
  } catch (e: any) {
    result.ok = false;
    result.checks.db = false;
    result.dbError = e?.message || String(e);
  }

  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
    await transporter.verify();
    result.checks.smtp = true;
  } catch (e: any) {
    result.ok = false;
    result.checks.smtp = false;
    result.smtpError = e?.message || String(e);
    // @ts-ignore capture code if present
    if (e && (e as any).code) result.smtpCode = (e as any).code;
  }

  res.status(result.ok ? 200 : 500).json(result);
}


