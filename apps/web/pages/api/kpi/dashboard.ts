import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../../src/lib/rate-limit";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await rateLimit(req, res))) return;
  res.status(200).json({ totalRevenue: 254000, arBalance: 48000, apBalance: 36500, ordersToday: 27 });
}
