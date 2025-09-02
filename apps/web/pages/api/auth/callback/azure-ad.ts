import type { NextApiRequest, NextApiResponse } from 'next';
import { mask, mocksEnabled } from '../../../../lib/mask';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!mocksEnabled()) return res.status(404).end();
  console.log('MOCK: azure-ad callback', {
    code: mask(req.query.code as string),
    client: !!process.env.AZURE_AD_CLIENT_ID,
    tenant: mask(process.env.AZURE_AD_TENANT_ID),
  });
  res.status(200).json({ ok: true, route: 'azure-ad-callback', mock: true });
}
