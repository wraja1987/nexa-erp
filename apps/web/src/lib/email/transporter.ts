import nodemailer from 'nodemailer';

export function createTransporter() {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465; // 465 = SMTPS, 587 usually STARTTLS
  const user = process.env.SMTP_USER!;
  const pass = (process.env.SMTP_PASS || '').trim();
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function verifyTransporter() {
  try {
    await createTransporter().verify();
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || String(e) };
  }
}


