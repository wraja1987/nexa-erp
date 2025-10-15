import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyTransporter } from '@/lib/email/transporter';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const haveGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const haveAzure = !!(process.env.AZURE_AD_TENANT_ID && process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET);
  const v = await verifyTransporter();
  res.status(200).json({
    ok: true,
    from: process.env.EMAIL_FROM || null,
    providers: { email: true, google: haveGoogle, azure_ad: haveAzure },
    smtp: v,
    nextauthUrl: process.env.NEXTAUTH_URL,
    trustHost: true,
  });
}


