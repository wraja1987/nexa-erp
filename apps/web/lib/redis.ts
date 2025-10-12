import type { Redis } from "ioredis";
let client: Redis | null = null;
export const getRedis = () => client;
export const setRedis = (c: Redis | null) => { client = c; };
export default { get: async (_k: string) => null, set: async (_k: string, _v: string) => undefined };
