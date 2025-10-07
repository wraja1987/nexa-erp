// pages/api/status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { safe } from "@/lib/api-safe";
import { ENV } from "@/lib/env";
import { getRedis } from "@/lib/redis";

export default safe(async function handler(req: NextApiRequest, res: NextApiResponse) {
  // allow HEAD and OPTIONS
  if (req.method === "HEAD") return res.status(200).end();
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET,HEAD,OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET,HEAD,OPTIONS");
    return res.status(405).end();
  }

  const token = process.env.STATUS_TOKEN;
  if (token && req.headers.authorization !== `Bearer ${token}`) {
    return res.status(401).json({ ok: false });
  }

  const redis = await getRedis();
  res.status(200).json({
    ok: true,
    env: ENV.NODE_ENV,
    region: process.env.VERCEL_REGION ?? "unknown",
    integrations: { redis: !!redis },
  });
});
