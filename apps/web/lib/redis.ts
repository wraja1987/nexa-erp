import type { Redis } from "ioredis";
let client: Redis | null = null;
export const getRedis = () => client;
export const setRedis = (c: Redis) => { client = c; };
export default { get: async () => null, set: async () => undefined };
