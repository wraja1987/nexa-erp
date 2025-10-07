let cached: any = undefined;

export async function getRedis() {
  if (cached !== undefined) return cached;

  const url = process.env.REDIS_URL;
  if (!url) return (cached = null);

  // Prevent bundlers from resolving these at build time
  const req: NodeRequire = eval('require');

  // Try ioredis first
  try {
    const Redis = req('ioredis');        // ← no build-time resolution
    cached = new Redis(url);
    return cached;
  } catch {}

  // Fallback to node-redis if present
  try {
    const { createClient } = req('redis');  // ← no build-time resolution
    const client = createClient({ url });
    await client.connect();
    cached = client;
    return cached;
  } catch {
    console.warn('[redis] No client available; continuing without Redis');
    return (cached = null);
  }
}
