import { redis } from "../cache/redis";

const IDEMPOTENCY_PREFIX = "idemp:";

export async function getIdempotent<T>(key: string): Promise<T | null> {
  const raw = await redis.get(IDEMPOTENCY_PREFIX + key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setIdempotent<T>(key: string, value: T, ttlSec = 60): Promise<void> {
  await redis.set(IDEMPOTENCY_PREFIX + key, JSON.stringify(value), "EX", ttlSec);
}






