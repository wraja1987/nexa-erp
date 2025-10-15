import nodemailer from 'nodemailer';

let cached: ReturnType<typeof nodemailer.createTransport> | null = null;

export function getTransporter() {
  if (cached) return cached;
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || '587');
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!; // NOTE: no spaces; exactly as Vercel env value

  cached = nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass },
    ...(secure ? {} : { tls: { rejectUnauthorized: false } })
  });
  return cached;
}


