const required = ['NEXTAUTH_URL','NEXTAUTH_SECRET','DATABASE_URL','NEXT_PUBLIC_APP_URL','EMAIL_FROM','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS'];
if (process.env.NODE_ENV === 'production') {
  const missing = required.filter(k => !process.env[k as keyof NodeJS.ProcessEnv]);
  if (missing.length) console.error('[env] Missing envs:', missing);
}

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
