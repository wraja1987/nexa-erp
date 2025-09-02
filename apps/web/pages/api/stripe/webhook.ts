import type { NextApiRequest, NextApiResponse } from 'next';
import { mask, mocksEnabled } from '../../../lib/mask';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!mocksEnabled()) return res.status(404).end();
  const sig = req.headers['stripe-signature'] as string | undefined;
  console.log('MOCK: stripe webhook', { sig: mask(sig), whsec: mask(process.env.STRIPE_WEBHOOK_SECRET) });
  res.status(200).json({ ok: true, event: 'mock', mock: true });
}
