import type { NextApiRequest, NextApiResponse } from "next";
import { safe } from "@/lib/api-safe";
import { ENV } from "@/lib/env";
import { getRedis } from "@/lib/redis";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const redis = await getRedis();
  res.status(200).json({
    ok: true,
    env: ENV.NODE_ENV,
    region: process.env.VERCEL_REGION ?? "unknown",
    integrations: { redis: !!redis },
  });
}
export default safe(handler);
