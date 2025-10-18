import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { redisLimiter, inMemoryLimiter } from "@/lib/rate-limit";

const limiter = process.env.REDIS_URL
  ? redisLimiter({ windowMs: 5*60*1000, max: 5, keyPrefix: "auth" })
  : inMemoryLimiter({ windowMs: 5*60*1000, max: 5, keyPrefix: "auth" });

export function withAuthRateLimit(handler: NextApiHandler): NextApiHandler {
  return async function limited(req: NextApiRequest, res: NextApiResponse) {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "0.0.0.0";
    const key = `${ip}:${req.body?.email || req.query?.email || "-"}`;
    try {
      const verdict = await limiter(key);
      res.setHeader("X-RateLimit-Remaining", String(verdict.remaining));
      res.setHeader("X-RateLimit-Reset", String(verdict.resetMs));
      if (!verdict.allowed) {
        return res.status(429).json({ ok:false, error:"Too many attempts. Try again later." });
      }
      return handler(req, res);
    } catch {
      return handler(req, res);
    }
  };
}

import { getSession, canViewAdmin } from "./auth";

export async function requireAdmin(section: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthenticated");
  if (!canViewAdmin(section, session.user.role)) throw new Error("Forbidden");
  return session.user;
}

export async function requireAppAccess(module: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthenticated");
  // Add fine-grained checks per module if needed
  return session.user;
}
