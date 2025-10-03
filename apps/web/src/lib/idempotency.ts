import type { NextApiResponse } from "next";
import { getRedis } from "./redis"; import { auditLog } from "./audit";
export async function ensureIdempotent(key: string, ttlSec?: number): Promise<"ok"|"duplicate"> {
  const r = getRedis(); const k = `idem:${key}`;
  const nx = await r.set(k, "1", "EX", ttlSec ?? Number(process.env.IDEMPOTENCY_TTL_SEC ?? 60), "NX");
  return nx ? "ok" : "duplicate";
}
export async function withIdempotency(res: NextApiResponse, makeKey: () => string, ttlSec?: number): Promise<boolean> {
  const key = makeKey(); const state = await ensureIdempotent(key, ttlSec);
  if (state === "duplicate") { res.status(202).json({ ok: true, deduped: true }); auditLog({ type: "idempotency_skip", key }); return false; }
  return true;
}
export function stripeEventKey(eventId: string) { return `stripe_evt_${eventId}`; }
