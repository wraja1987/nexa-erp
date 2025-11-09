import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string) || 't-demo';

    // Prefer Redis for speed
    const r = await getRedis();
    if (r) {
      const raw = await r.lrange(`audit:${tenantId}`, 0, 50);
      const parsed = raw.map((j: string) => { try { return JSON.parse(j); } catch { return null; } }).filter(Boolean);
      return res.status(200).json(parsed);
    }

    // Fallback to DB
    const rows = await prisma.auditLog.findMany({ where: { tenantId }, orderBy: { at: 'desc' }, take: 50 });
    return res.status(200).json(rows);
  } catch (e: any) {
    return res.status(200).json([]);
  }
}
