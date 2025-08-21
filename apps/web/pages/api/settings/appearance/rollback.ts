import type { NextApiRequest, NextApiResponse } from 'next';
import { findSnapshot, addSnapshot } from '../../../../lib/themeStore';

function allow(req: NextApiRequest): boolean {
  const ff = process.env.FEATURE_FLAG_THEME_AI || process.env.NEXT_PUBLIC_FEATURE_FLAG_THEME_AI;
  const role = (req.headers.cookie || '').match(/role=([^;]+)/)?.[1]?.toUpperCase();
  return ff === '1' && (role === 'SUPERADMIN' || role === 'ADMIN');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!allow(req)) return res.status(403).json({ error: 'Forbidden' });
  const id = String((req.query.id || ''));
  const snap = findSnapshot(id);
  if (!snap) return res.status(404).json({ error: 'Not found' });
  // Applying snapshot: create a new head snapshot for audit trail
  addSnapshot({ id: `${id}-reapply`, createdAtIso: new Date().toISOString(), createdBy: 'admin', tokens: snap.tokens, note: `Reapplied ${id}` });
  res.json({ ok: true });
}


