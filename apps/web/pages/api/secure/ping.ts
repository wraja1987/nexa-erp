import type { NextApiRequest, NextApiResponse } from "next";
import { requireApiAuth } from "@/src/lib/auth/api-guard";

export default requireApiAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true, route: "/api/secure/ping", ts: Date.now() });
});
