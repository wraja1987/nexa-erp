import { redis } from "./redis";
export async function getJSON<T>(key: string){
  try { const r=await redis.get(key); return r? JSON.parse(r) as T : null; } catch { return null; }
}
export async function setJSON(key: string, value: unknown, ttlSec: number, tags: string[]=[]){
  try {
    const m = redis.multi();
    m.set(key, JSON.stringify(value), "EX", ttlSec);
    for (const t of tags) {
      const setKey = `tag:${t}`;
      m.sadd(setKey, key);
      // Keep tag set around at least as long as the value
      m.expire(setKey, Math.max(ttlSec, 300));
    }
    await m.exec();
  } catch {}
}
export async function invalidateTags(tags: string[]){
  try {
    for (const t of tags){
      const setKey = `tag:${t}`;
      const keys = await redis.smembers(setKey);
      if (keys.length) await redis.del(...keys);
      await redis.del(setKey);
    }
  } catch {}
}
