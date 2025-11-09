import { getRedis } from "@/lib/redis";

const PREFIX = "idemp:";

export async function idempotentGet<T = any>(key: string): Promise<T | null> {
  const redis = await getRedis();
  if (!redis) return null;
  const raw = await redis.get(PREFIX + key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function idempotentSet<T = any>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  await redis.set(PREFIX + key, JSON.stringify(value), "EX", ttlSeconds);
}
