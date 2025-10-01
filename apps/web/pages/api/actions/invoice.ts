import type { NextApiRequest, NextApiResponse } from "next";
import { createInvoice, fetchInvoice } from "../../../server/actions.service";
import { sendError } from "../../../lib/http/errors";
import { rateLimitRedis } from "../../../lib/ratelimit.redis";
import { getIdempotent, setIdempotent } from "../../../lib/cache/idempotency";
import { invalidateTags } from "../../../lib/cache/tags";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const keyHeader = (req.headers["idempotency-key"] as string) || "";
    const rlKey = `invoice:${req.socket.remoteAddress || "ip"}`;
    if (!(await rateLimitRedis(rlKey))) return sendError(res, "RATE_LIMIT", "Too many requests", 429);
    if (keyHeader) {
      const hit = await getIdempotent<any>(keyHeader);
      if (hit) { res.status(201).json(hit); return; }
    }
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const created = await createInvoice(body || {});
      const payload = { ok: true, resource: created, provisional: false };
      if (keyHeader) await setIdempotent(keyHeader, payload, 60);
      // Invalidate KPI caches
      await invalidateTags(["kpi:revenue","kpi:invoices"]);
      res.status(201).json(payload);
    } catch (e: any) {
      return sendError(res, "CREATE_INVOICE_FAILED", e?.message || "Failed to create invoice", 500);
    }
    return;
  }
  if (req.method === "GET") {
    const id = String(req.query.id || "");
    if (!id) { return sendError(res, "VALIDATION", "id required", 422); }
    const data = await fetchInvoice(id);
    res.status(200).json({ ok: true, resource: data });
    return;
  }
  res.setHeader("Allow", "GET, POST");
  return sendError(res, "METHOD_NOT_ALLOWED", "Method not allowed", 405);
}
