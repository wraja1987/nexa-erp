import type { NextApiRequest, NextApiResponse } from 'next';
import { createTransporter, verifyTransporter } from '@/lib/email/transporter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const key = typeof req.query.key === 'string' ? req.query.key : undefined;
  const host = req.headers.host || '';
  const prodGuard = (() => {
    try {
      if (process.env.NODE_ENV !== 'production') return false;
      const origin = new URL(process.env.NEXTAUTH_URL || '');
      return origin.host === host;
    } catch {
      return false;
    }
  })();

  if (!(key && key === process.env.NEXTAUTH_SECRET) && !prodGuard) {
    return res.status(403).json({ ok: false, error: 'forbidden' });
  }

  const to = typeof req.query.to === 'string' ? req.query.to : undefined;
  if (!to) {
    return res.status(400).json({ ok: false, error: 'missing_to' });
  }

  const verify = await verifyTransporter();
  if (!verify.ok) {
    return res.status(200).json({ ok: false, where: 'verify', error: verify.error });
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      to,
      from: process.env.EMAIL_FROM,
      subject: 'Nexa test',
      text: 'Nexa SMTP test',
      html: '<p>Nexa SMTP test</p>',
    });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(200).json({ ok: false, where: 'send', error: String(err) });
  }
}


