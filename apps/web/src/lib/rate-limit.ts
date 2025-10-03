import type { NextApiRequest, NextApiResponse } from "next";
import { getRedis } from "./redis";
import { auditLog } from "./audit";

type KeyParts = { ip?: string|null; route: string; tenant?: string|null };

const mem = new Map<string, number[]>();

function clientIp(req: NextApiRequest): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  const ip = xf.split(",")[0]?.trim() || (req.socket as any)?.remoteAddress || "0.0.0.0";
  return String(ip);
}

export function buildKey({ ip, route, tenant }: KeyParts) {
  const t = tenant || "anon";
  const i = ip || "0.0.0.0";
  return `rl:${t}:${route}:${i}`;
}

async function redisCount(key: string, windowSec: number): Promise<number | null> {
  try {
    const r = getRedis();
    const now = Date.now();
    const ttlMs = windowSec * 1000;
    const multi = r.multi();
    multi.zremrangebyscore(key, 0, now - ttlMs);
    multi.zadd(key, now, String(now));
    multi.zcard(key);
    multi.expire(key, windowSec);
    const [, , count] = (await multi.exec()) ?? [null, null, [null, 0]];
    const current = Array.isArray(count) ? Number(count[1]) : Number(count);
    return Number.isFinite(current) ? current : 0;
  } catch {
    return null;
  }
}

function memCount(key: string, windowSec: number): number {
  const now = Date.now();
  const cutoff = now - windowSec * 1000;
  const arr = mem.get(key) ?? [];
  const pruned = arr.filter(t => t >= cutoff);
  pruned.push(now);
  mem.set(key, pruned);
  return pruned.length;
}

export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  opts?: { windowSec?: number; max?: number }
): Promise<boolean> {
  // Base limits
  let windowSec = Number(opts?.windowSec ?? process.env.RATE_LIMIT_WINDOW_SEC ?? 60);
  let max = Number(opts?.max ?? process.env.RATE_LIMIT_MAX ?? 100);

  // Test-only header overrides (ignored in production)
  if (process.env.NODE_ENV !== "production") {
    const hdrMax = Number(req.headers["x-rl-max"] || "");
    const hdrWin = Number(req.headers["x-rl-window"] || "");
    if (Number.isFinite(hdrMax) && hdrMax > 0) max = hdrMax;
    if (Number.isFinite(hdrWin) && hdrWin > 0) windowSec = hdrWin;
  }

  const route = req.url?.split("?")[0] || "unknown";
  const ip = clientIp(req);
  const tenant = (req.headers["x-tenant-id"] as string) || null;
  const key = buildKey({ ip, route, tenant });

  let current = await redisCount(key, windowSec);
  if (current === null) current = memCount(key, windowSec);

  if (current > max) {
    const retryAfter = Math.ceil(windowSec);
    res.setHeader("Retry-After", String(retryAfter));
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", "0");
    res.status(429).json({ error: "rate_limited", message: "Too many requests. Please try again shortly." });
    auditLog({ type: "rate_limit", route, ip, tenant, status: 429, windowSec, max, count: current, method: req.method, ua: req.headers["user-agent"] || null });
    return false;
  }

  res.setHeader("X-RateLimit-Limit", String(max));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - current)));
  return true;
}
