import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const totalRevenue = 254000;
    const arBalance    = 48000;
    const apBalance    = 36500;
    const ordersToday  = 27;
    const invOnHand    = 15234;
    res.json({
      kpis: [
        { key: "revenue_total",  label: "Total Revenue", value: totalRevenue, currency: "GBP", trend: 6.2 },
        { key: "ar_balance",     label: "A/R Balance",   value: arBalance,    currency: "GBP", trend: -1.1 },
        { key: "ap_balance",     label: "A/P Balance",   value: apBalance,    currency: "GBP", trend: 0.9 },
        { key: "orders_today",   label: "Orders Today",  value: ordersToday,  trend: 3.4 },
        { key: "inventory_onhand", label: "Inventory On Hand", value: invOnHand, trend: 0.5 },
      ]
    });
  } catch (e:any) {
    res.status(500).json({ error: "kpi_failed", message: e?.message || "error" });
  }
}
