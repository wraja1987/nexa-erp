// Non-fatal Redis shim; replace with a real client if/when REDIS_URL is set
import type { Redis } from "ioredis";
let client: Redis | null = null;

export const getRedis = () => client;
export const setRedis = (c: Redis | null) => { client = c; };

const redis = {
  get: async (_key: string) => null as unknown,
  set: async (_key: string, _val: unknown, _ttl?: number) => void 0
};
export default redis;
