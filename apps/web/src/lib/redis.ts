let cached: any = undefined;

export async function getRedis() {
  if (cached !== undefined) return cached;
  const url = process.env.REDIS_URL;
  if (!url) return (cached = null);

  try {
    // Try ioredis first
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Redis = require("ioredis");
    cached = new Redis(url);
    return cached;
  } catch {
    try {
      // Fallback to node-redis if present
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require("redis");
      const client = createClient({ url });
      await client.connect();
      cached = client;
      return cached;
    } catch {
      console.warn("[redis] No client available; continuing without Redis");
      return (cached = null);
    }
  }
}
