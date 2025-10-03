import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../src/lib/rate-limit";
import { withIdempotency } from "../../src/lib/idempotency";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") { res.status(405).end(); return; }
  if (!(await rateLimit(req, res))) return;
  const idemHeader = (req.headers["idempotency-key"] as string) || "";
  const idemKey = () => `write:${idemHeader || "no-key"}`;
  if (!(await withIdempotency(res, idemKey, Number(process.env.IDEMPOTENCY_TTL_SEC||60)))) return;
  res.status(201).json({ ok: true, created: true });
}
