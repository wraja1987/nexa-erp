import type { NextApiRequest, NextApiResponse } from 'next';

let limiter: any = null;
try {
  // Try to load whichever export exists, fallback to no-op
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const m = require('@/src/lib/rate-limit');
  limiter = m.redisLimiter || m.limiter || m.default || null;
} catch (_) {}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (limiter) {
      // Best-effort rate limit; don't fail the endpoint if limiter errors
      await Promise.resolve(limiter(`status:${req.socket?.remoteAddress || 'unknown'}`));
    }
  } catch {}
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, env: process.env.NODE_ENV || 'unknown' });
}
