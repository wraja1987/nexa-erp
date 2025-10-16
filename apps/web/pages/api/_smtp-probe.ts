import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const secure = process.env.SMTP_SECURE === "true";
  const portOk = (secure && String(process.env.SMTP_PORT) === "465") || (!secure && String(process.env.SMTP_PORT) === "587");
  const fromOk = !!(process.env.EMAIL_FROM && /^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/.test(process.env.EMAIL_FROM || ""));
  const ok = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM) && fromOk && portOk;

  res.status(200).json({
    ok,
    fromOk,
    portOk,
    host: !!process.env.SMTP_HOST,
    port: !!process.env.SMTP_PORT,
    user: !!process.env.SMTP_USER,
    pass: !!process.env.SMTP_PASS,
    from: !!process.env.EMAIL_FROM,
  });
}


