import type { NextApiRequest, NextApiResponse } from 'next';
import { mask, mocksEnabled } from '../../../../lib/mask';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!mocksEnabled()) return res.status(404).end();
  console.log('MOCK: google callback', {
    code: mask(req.query.code as string),
    client: !!process.env.GOOGLE_CLIENT_ID,
  });
  res.status(200).json({ ok: true, route: 'google-callback', mock: true });
}
