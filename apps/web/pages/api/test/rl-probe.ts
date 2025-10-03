import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../../src/lib/rate-limit";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ok = await rateLimit(req, res, {
    windowSec: Number(req.headers["x-rl-window"] || 8),
    max: Number(req.headers["x-rl-max"] || 3),
  });
  if (!ok) return;
  res.status(200).json({ ok: true });
}
