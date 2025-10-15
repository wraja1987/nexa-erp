import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyTransporter } from '@/lib/email/transporter';
import { PrismaClient } from '@prisma/client';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const haveGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const haveAzure = !!(process.env.AZURE_AD_TENANT_ID && process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET);
  const v = await verifyTransporter();
  // DB table presence: VerificationToken specifically (adapter relies on it)
  let dbHasVerificationToken = false;
  try {
    const prisma = new PrismaClient();
    const sql = `SELECT (to_regclass('public."VerificationToken"') IS NOT NULL) AS "VerificationToken"`;
    const [presence] = await prisma.$queryRawUnsafe<any[]>(sql);
    dbHasVerificationToken = Boolean((presence as any)?.VerificationToken);
    await prisma.$disconnect();
  } catch {}
  let adapterError: string | undefined;
  try {
    const prisma = new PrismaClient();
    await prisma.user.findFirst({ select: { id: true } }).catch((e:any)=>{ adapterError = e?.message || String(e); });
    await prisma.$disconnect();
  } catch (e:any) {
    adapterError = e?.message || String(e);
  }
  res.status(200).json({
    ok: true,
    from: process.env.EMAIL_FROM || null,
    providers: { email: true, google: haveGoogle, azure_ad: haveAzure },
    smtp: v,
    dbHasVerificationToken,
    adapterError,
    nextauthUrl: process.env.NEXTAUTH_URL,
    trustHost: true,
  });
}


