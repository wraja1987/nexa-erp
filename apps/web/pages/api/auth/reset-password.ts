import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../src/lib/rate-limit";
import { auditLog } from "../../src/lib/audit";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") { res.status(405).end(); return; }
  if (!(await rateLimit(req, res, { windowSec: Number(process.env.RATE_LIMIT_WINDOW_SEC||60), max: Math.max(10, Number(process.env.RATE_LIMIT_MAX||100)/5) }))) return;
  const email = (req.body && (req.body.email || (req.query?.email as string))) as string | undefined;
  if (!email) { res.status(400).json({ error: "missing_email" }); return; }
  auditLog({ type: "password_reset_request", email, status: "queued" });
  res.status(200).json({ ok: true });
}
