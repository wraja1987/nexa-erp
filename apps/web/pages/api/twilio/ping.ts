import type { NextApiRequest, NextApiResponse } from 'next';
import { mask, mocksEnabled } from '../../../lib/mask';
export default function handler(_: NextApiRequest, res: NextApiResponse) {
  if (!mocksEnabled()) return res.status(404).end();
  console.log('MOCK: twilio ping', { sid: mask(process.env.TWILIO_ACCOUNT_SID) });
  res.status(200).json({ ok: true, provider: 'twilio', mock: true });
}
