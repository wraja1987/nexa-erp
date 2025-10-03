import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { getRedis } from "../../src/lib/redis";
import { auditLog } from "../../src/lib/audit";
import { stripeEventKey, ensureIdempotent } from "../../src/lib/idempotency";
import { rateLimit } from "../../src/lib/rate-limit";
export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") { res.status(405).end(); return; }
  if (!(await rateLimit(req, res, { windowSec: 60, max: 100 }))) return;
  const sig = req.headers["stripe-signature"]; if (!sig) { res.status(400).send("Missing stripe-signature"); return; }
  const buf = await buffer(req); let event: Stripe.Event;
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
    event = stripe.webhooks.constructEvent(buf, sig as string, secret);
  } catch (err: any) {
    auditLog({ type: "stripe_webhook_verify_fail", err: String(err?.message||err) });
    res.status(400).send(`Webhook Error: ${err.message}`); return;
  }
  const r = getRedis(); const k = "wh:" + stripeEventKey(event.id);
  const first = await r.set(k, "1", "EX", 60*60*24, "NX");
  if (!first) { auditLog({ type: "stripe_webhook_dupe", eventId: event.id }); res.status(200).json({ ok: true, duplicate: true }); return; }
  const idemKey = (req.headers["idempotency-key"] as string) || "";
  if (idemKey) { const idem = await ensureIdempotent(`wh:${idemKey}`, 300); if (idem === "duplicate") { res.status(202).json({ ok: true, deduped: true }); return; } }
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        // persist idempotently (UPSERT on external_id)
        break;
      case "charge.refunded":
        // persist idempotently
        break;
      default: break;
    }
    auditLog({ type: "stripe_webhook_handled", eventId: event.id, eventType: event.type });
    res.status(200).json({ ok: true });
  } catch (err:any) {
    auditLog({ type: "stripe_webhook_error", eventId: event.id, error: String(err?.message||err) });
    res.status(500).json({ error: "server_error" });
  }
}
