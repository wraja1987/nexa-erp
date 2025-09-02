import type { NextApiRequest, NextApiResponse } from 'next';
import { mask, mocksEnabled } from '../../../../lib/mask';
export default function handler(_: NextApiRequest, res: NextApiResponse) {
  if (!mocksEnabled()) return res.status(404).end();
  res.status(200).json({
    ok: true,
    mock: true,
    openai_present: !!process.env.OPENAI_API_KEY,
    example_log: { key: mask(process.env.OPENAI_API_KEY) }
  });
}
