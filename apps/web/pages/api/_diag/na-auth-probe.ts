import type { NextApiRequest, NextApiResponse } from 'next';
import verifyCredentials from '../../../src/lib/auth-credentials';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.method === 'POST' ? req.body || {} : req.query || {} as any;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'missing' });
    const user = await verifyCredentials(String(email), String(password));
    return res.status(200).json({ ok: !!user, user: user ? { email: user.email, role: user.role, tenantId: user.tenantId } : null });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
