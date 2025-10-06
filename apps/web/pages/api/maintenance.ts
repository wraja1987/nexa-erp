import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.status(200).json({ maintenance: false });
}
