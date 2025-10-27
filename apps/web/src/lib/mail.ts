export async function sendMailSafe({ to, subject, html }: { to: string; subject: string; html: string }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;
  if (!host || !user || !pass || !from) return { ok: false, skipped: true, reason: "SMTP_NOT_CONFIGURED" } as const;
  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass },
  });
  await transporter.sendMail({ from, to, subject, html });
  return { ok: true as const };
}








