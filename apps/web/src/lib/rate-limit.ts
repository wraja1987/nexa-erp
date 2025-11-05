type Key = string;

class SlidingWindowLimiter {
  private windowMs: number;
  private limit: number;
  private hits: Map<Key, number[]> = new Map();

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  allow(key: Key): boolean {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const arr = this.hits.get(key) || [];
    const kept = arr.filter((t) => t > cutoff);
    if (kept.length >= this.limit) {
      this.hits.set(key, kept);
      return false;
    }
    kept.push(now);
    this.hits.set(key, kept);
    return true;
  }
}

const globalAny = global as any;
if (!globalAny.__nexa_rl) globalAny.__nexa_rl = {} as Record<string, SlidingWindowLimiter>;

export function getLimiter(name: string, limit: number, windowMs: number): SlidingWindowLimiter {
  const store = (global as any).__nexa_rl as Record<string, SlidingWindowLimiter>;
  if (!store[name]) store[name] = new SlidingWindowLimiter(limit, windowMs);
  return store[name];
}

export function keyFromReq(req: Request, userId?: string | null): string {
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '')
    .split(',')[0]
    .trim();
  return userId ? `${ip}:${userId}` : ip || 'unknown';
}

import { createClient } from "./redis";
import { getRedis } from './redis';

type LimiterOpts = { windowMs: number; max: number; keyPrefix?: string; };
type Verdict = { allowed: boolean; remaining: number; resetMs: number; };

const memStore = new Map<string, { count: number; expires: number }>();

export function inMemoryLimiter({ windowMs, max, keyPrefix = "rl" }: LimiterOpts) {
  return async (key: string): Promise<Verdict> => {
    const now = Date.now();
    const k = `${keyPrefix}:${key}`;
    const cur = memStore.get(k);
    if (!cur || cur.expires <= now) {
      memStore.set(k, { count: 1, expires: now + windowMs });
      return { allowed: true, remaining: max - 1, resetMs: windowMs };
    }
    if (cur.count >= max) return { allowed: false, remaining: 0, resetMs: cur.expires - now };
    cur.count += 1;
    return { allowed: true, remaining: max - cur.count, resetMs: cur.expires - now };
  };
}

export function redisLimiter({ windowMs, max, keyPrefix = "rl" }: LimiterOpts) {
  const url = process.env.REDIS_URL;
  if (!url) return inMemoryLimiter({ windowMs, max, keyPrefix });
  const client = createClient({ url, socket: { reconnectStrategy: () => 1000 } });
  client.on("error", () => {});
  if (!client.isOpen) client.connect().catch(()=>{});
  return async (key: string): Promise<Verdict> => {
    const k = `${keyPrefix}:${key}`;
    const res = await (client as any).multi().incr(k).ttl(k).exec();
    const count = Number(res?.[0]?.[1] ?? 1);
    let ttl = Number(res?.[1]?.[1] ?? -1);
    if (ttl < 0) { await client.expire(k, Math.ceil(windowMs/1000)); ttl = Math.ceil(windowMs/1000); }
    const remaining = Math.max(0, max - count);
    return { allowed: count <= max, remaining, resetMs: ttl*1000 };
  };
}

// --- NO REDIS FALLBACK (build-safe) ---
async function __ensureRedisOrFallback() {
  const client = await getRedis();
  if (!client) {
    // TODO: optionally implement a tiny in-memory limiter here
    // For now, we just act as if limits are not exceeded.
    return null;
  }
  return client;
}
