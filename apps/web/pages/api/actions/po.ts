import type { NextApiRequest, NextApiResponse } from "next";
import { createPO, fetchPO } from "../../../server/actions.service";
import { sendError } from "../../../lib/http/errors";
import { rateLimitRedis } from "../../../lib/ratelimit.redis";
import { getIdempotent, setIdempotent } from "../../../lib/cache/idempotency";
import { invalidateTags } from "../../../lib/cache/tags";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const keyHeader = (req.headers["idempotency-key"] as string) || "";
    const rlKey = `po:${req.socket.remoteAddress || "ip"}`;
    if (!(await rateLimitRedis(rlKey))) return sendError(res, "RATE_LIMIT", "Too many requests", 429);
    if (keyHeader) {
      const hit = await getIdempotent<any>(keyHeader);
      if (hit) { res.status(201).json(hit); return; }
    }
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const created = await createPO(body || {});
      const payload = { ok: true, resource: created, provisional: false };
      if (keyHeader) await setIdempotent(keyHeader, payload, 60);
      await invalidateTags(["kpi:wip"]);
      res.status(201).json(payload);
    } catch (e: any) {
      return sendError(res, "CREATE_PO_FAILED", e?.message || "Failed to create PO", 500);
    }
    return;
  }
  if (req.method === "GET") {
    const id = String(req.query.id || "");
    if (!id) { return sendError(res, "VALIDATION", "id required", 422); }
    const data = await fetchPO(id);
    res.status(200).json({ ok: true, resource: data });
    return;
  }
  res.setHeader("Allow", "GET, POST");
  return sendError(res, "METHOD_NOT_ALLOWED", "Method not allowed", 405);
}
