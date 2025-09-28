import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const { name, email, company, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ ok: false, error: 'Missing fields' });
  // For static export environments, simply echo success so the CTA doesn’t break
  return res.status(200).json({ ok: true });
}








