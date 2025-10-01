import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
