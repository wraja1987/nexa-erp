import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../src/lib/rate-limit";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await rateLimit(req, res, { windowSec: Number(process.env.RATE_LIMIT_WINDOW_SEC||60), max: Number(process.env.RATE_LIMIT_MAX||100) }))) return;
  try {
    const totalRevenue = 254000;
    const arBalance    = 48000;
    const apBalance    = 36500;
    const ordersToday  = 27;
    res.status(200).json({ totalRevenue, arBalance, apBalance, ordersToday });
  } catch (e:any) {
    res.status(500).json({ error: "kpi_failed", message: e?.message || "error" });
  }
}
