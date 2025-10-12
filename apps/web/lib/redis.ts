import type { Redis } from "ioredis";
let client: Redis | null = null;
export const getRedis = () => client;
export const setRedis = (c: Redis) => { client = c; };
const kv = new Map<string, string>();
export default {
  get: async (k: string) => kv.get(k) ?? null,
  set: async (k: string, v: string) => { kv.set(k, v); },
};
