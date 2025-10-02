import { redis } from "./cache/redis";

type Bucket = { tokens: number; updated: number };

export async function rateLimitRedis(key: string, capacity = 30, refillPerSec = 10): Promise<boolean> {
  const now = Date.now() / 1000;
  const raw = await redis.get(`rl:${key}`);
  const bucket: Bucket = raw ? JSON.parse(raw) : { tokens: capacity, updated: now };
  const elapsed = Math.max(0, now - bucket.updated);
  const refill = elapsed * refillPerSec;
  bucket.tokens = Math.min(capacity, bucket.tokens + refill);
  bucket.updated = now;
  if (bucket.tokens < 1) {
    await redis.set(`rl:${key}`, JSON.stringify(bucket), "EX", 3600);
    return false;
  }
  bucket.tokens -= 1;
  await redis.set(`rl:${key}`, JSON.stringify(bucket), "EX", 3600);
  return true;
}






