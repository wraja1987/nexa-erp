import type { NextApiRequest, NextApiResponse } from 'next';
import { mask, mocksEnabled } from '../../../../lib/mask';
export default function handler(_: NextApiRequest, res: NextApiResponse) {
  if (!mocksEnabled()) return res.status(404).end();
  console.log('MOCK: hmrc vat ping', {
    env: process.env.HMRC_ENV || process.env.HMRC_ENVIRONMENT,
    client: mask(process.env.HMRC_CLIENT_ID)
  });
  res.status(200).json({ ok: true, provider: 'hmrc-vat', env: process.env.HMRC_ENV || process.env.HMRC_ENVIRONMENT, mock: true });
}
