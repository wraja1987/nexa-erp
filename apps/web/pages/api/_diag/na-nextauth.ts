import type { NextApiRequest, NextApiResponse } from 'next';
import { getTransporter } from '@/lib/email/transporter';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const t = getTransporter();
    let smtpOk = false; let smtpError: string | undefined;
    try { await t.verify(); smtpOk = true; } catch (e: any) { smtpError = e?.message || String(e); }
    res.status(200).json({
      ok: smtpOk,
      smtpError,
      from: process.env.EMAIL_FROM || null,
      providers: {
        email: true,
        azure: Boolean(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID),
      }
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}


