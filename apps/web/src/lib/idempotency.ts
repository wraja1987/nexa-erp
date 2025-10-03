import type { NextApiRequest, NextApiResponse } from "next";
import { getRedis } from "./redis";
import { auditLog } from "./audit";

/**
 * Idempotency helper for write endpoints.
 * Accepts header "Idempotency-Key" (preferred) or falls back to Stripe event.id for webhooks.
 * Dedup TTL controlled by IDEMPOTENCY_TTL_SEC (default 60s) for generic writes.
 * For Stripe webhooks we store a long-lived marker per event.id (24h).
 */
export async function ensureIdempotent(
  key: string,
  ttlSec?: number
): Promise<"ok" | "duplicate"> {
  const r = getRedis();
  const k = `idem:${key}`;
  const exists = await r.set(k, "1", "EX", ttlSec ?? Number(process.env.IDEMPOTENCY_TTL_SEC ?? 60), "NX");
  return exists ? "ok" : "duplicate";
}

export async function withIdempotency(
  req: NextApiRequest,
  res: NextApiResponse,
  makeKey: () => string,
  ttlSec?: number
): Promise<boolean> {
  const key = makeKey();
  const state = await ensureIdempotent(key, ttlSec);
  if (state === "duplicate") {
    res.status(202).json({ ok: true, deduped: true });
    auditLog({ type: "idempotency_skip", key });
    return false;
  }
  return true;
}

export function stripeEventKey(eventId: string) {
  return `stripe_evt_${eventId}`;
}
