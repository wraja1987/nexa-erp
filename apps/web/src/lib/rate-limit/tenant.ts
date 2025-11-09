import { getRedis } from "@/lib/redis";

const WINDOW_SEC = 10;
const LIMIT = 60;

export async function rateLimitTenant(bucket: string, tenantId: string, userId?: string): Promise<boolean> {
  try {
    const redis = await getRedis();
    const key = `rl:${bucket}:${tenantId}:${userId || 'anon'}:${Math.floor(Date.now() / (WINDOW_SEC * 1000))}`;
    if (!redis) return true;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, WINDOW_SEC);
    return count <= LIMIT;
  } catch {
    return true;
  }
}
