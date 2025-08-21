import type { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';

function allow(req: NextApiRequest): boolean {
  const ff = process.env.FEATURE_FLAG_THEME_AI || process.env.NEXT_PUBLIC_FEATURE_FLAG_THEME_AI;
  const role = (req.headers.cookie || '').match(/role=([^;]+)/)?.[1]?.toUpperCase();
  return ff === '1' && (role === 'SUPERADMIN' || role === 'ADMIN');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!allow(req)) return res.status(403).json({ error: 'Forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const prompt: string = String(body?.prompt || '').slice(0, 400);
  // Simple guardrails
  if (/sk-[A-Za-z0-9]{20,}/.test(prompt)) return res.status(400).json({ error:'Secret-like token detected' });

  // Pseudo-AI: deterministically map prompt to tokens in Optra palette bounds
  const base = ['#0b0d14','#0b5fff','#e1e6ef','#f8fafc'];
  const idx = (prompt.length || 1) % base.length;
  const tokens = {
    '--bg': idx % 2 ? '#ffffff' : '#f8fafc',
    '--fg': '#0b0d14',
    '--card': base[3],
    '--border': '#e1e6ef',
  };
  res.json({ tokens });
}


