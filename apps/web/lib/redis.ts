import type { Redis } from "ioredis";
let client: Redis | null = null;
export const getRedis = () => client;
export const setRedis = (c: Redis | null) => { client = c; };
// No-op KV so code doesn't break if REDIS_URL isn't set
export default {
  async get(_key: string) { return null; },
  async set(_key: string, _val: string, _mode?: string, _ttl?: number) { return "OK" as const; }
};
