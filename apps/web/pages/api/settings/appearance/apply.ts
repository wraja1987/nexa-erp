import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { addSnapshot, getSnapshots } from '../../../../lib/themeStore';

function allow(req: NextApiRequest): boolean {
  const ff = process.env.FEATURE_FLAG_THEME_AI || process.env.NEXT_PUBLIC_FEATURE_FLAG_THEME_AI;
  const role = (req.headers.cookie || '').match(/role=([^;]+)/)?.[1]?.toUpperCase();
  return ff === '1' && (role === 'SUPERADMIN' || role === 'ADMIN');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!allow(req)) return res.status(403).json({ error: 'Forbidden' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const tokens = (body?.tokens || {}) as Record<string, string>;
  const id = crypto.randomUUID();
  const createdBy = (req.headers['x-user'] as string) || 'admin';
  addSnapshot({ id, createdAtIso: new Date().toISOString(), createdBy, tokens });
  res.json({ ok: true, id, snapshots: getSnapshots().map(s=>({ id: s.id, createdAtIso: s.createdAtIso })) });
}


