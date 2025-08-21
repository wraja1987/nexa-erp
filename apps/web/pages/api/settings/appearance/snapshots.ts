import type { NextApiRequest, NextApiResponse } from 'next';
import { getSnapshots } from '../../../../lib/themeStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const data = getSnapshots().map(s => ({ id: s.id, createdAtIso: s.createdAtIso, note: s.note }));
  res.json(data);
}


