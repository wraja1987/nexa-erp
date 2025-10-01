import { createClient } from "redis";

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
