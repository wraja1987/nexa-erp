import { getRedis } from "@/lib/redis";

export async function incMetric(name: string, labels: Record<string, string | number> = {}): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${k}=${v}`)
      .join(",");
    const key = `m:${name}:${labelStr}`;
    await redis.incr(key);
    await redis.expire(key, 60 * 60 * 24 * 7);
  } catch {}
}
