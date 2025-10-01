import type { NextApiRequest, NextApiResponse } from "next";
import { redisLimiter } from "@/src/lib/rate-limit";
const limit = redisLimiter({ windowMs: 60_000, max: 20, keyPrefix: "status" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "ip";
  const verdict = await limit(`status:${ip}`);
  if (!verdict.allowed) return res.status(429).json({ error: "Too many requests" });
  res.status(200).json({ ok: true, ts: Date.now() });
}
