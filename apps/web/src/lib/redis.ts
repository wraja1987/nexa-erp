// Optional Redis adapter for both node-redis and ioredis.
// Returns a connected client when possible, or `null` otherwise.
let cached: any = null;

export async function getRedis(): Promise<any|null> {
  if (cached) return cached;

  const url =
    process.env.REDIS_URL ||
    process.env.UPSTASH_REDIS_REST_URL || // common on Vercel
    "";

  if (!url) {
    console.warn("[redis] No REDIS_URL set; continuing without Redis");
    return null;
  }

  try {
    const { createClient } = require("redis");
    const client = createClient({ url });
    client.on?.("error", (e: any) =>
      console.warn("[redis] node-redis error:", e?.message || e)
    );
    if (!client.isOpen) await client.connect();
    cached = client;
    return cached;
  } catch (_e) {
    try {
      const Redis = require("ioredis");
      cached = new Redis(url);
      return cached;
    } catch (_e2) {
      console.warn("[redis] No client available; continuing without Redis");
      return null;
    }
  }
}
