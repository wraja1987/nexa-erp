// apps/web/src/lib/env.ts
import { z } from "zod";
const schema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),
  REDIS_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url().optional(),
});
export const ENV = schema.parse({
  NODE_ENV: process.env.NODE_ENV,
  REDIS_URL: process.env.REDIS_URL,
  DATABASE_URL: process.env.DATABASE_URL,
});
