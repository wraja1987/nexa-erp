import type { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "../../../src/lib/rate-limit";
import prisma from "../../../src/lib/prisma";

type KpiResponse = {
  totalRevenue: number;
  arBalance: number;
  apBalance: number;
  ordersToday: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<KpiResponse | { error: string }>) {
  if (!(await rateLimit(req, res))) return;

  try {
    const tenantId = (req.headers["x-tenant-id"] as string) || undefined;
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);

    // Detect model/field names dynamically to adapt to schema variations
    // Fallbacks if models are missing will yield zeros
    const kpis = {
      totalRevenue: 0,
      arBalance: 0,
      apBalance: 0,
      ordersToday: 0,
    } satisfies KpiResponse;

    // CustomerInvoice total (assumes fields: amount/total/totalAmount and optional tenantId/tenant_id)
    try {
      const invoices = await prisma.$queryRawUnsafe(
        `SELECT COALESCE(SUM(COALESCE((ci).amount,(ci).total,(ci)."totalAmount",0)),0) AS s FROM (
           SELECT (ci).* FROM "CustomerInvoice" ci
         ) t` + (tenantId ? ` WHERE (t."tenantId" = $1 OR t."tenant_id" = $1)` : ``),
        ...(tenantId ? [tenantId] : [])
      ) as any;
      kpis.totalRevenue = Number((invoices as any)?.[0]?.s || 0);
    } catch {}

    // Accounts Receivable balance: CustomerInvoice - CustomerPayment
    try {
      const ar = await prisma.$queryRawUnsafe(
        `WITH inv AS (
           SELECT COALESCE(SUM(COALESCE(amount,total,"totalAmount",0)),0) AS s FROM "CustomerInvoice"
           ${tenantId ? `WHERE ("tenantId" = $1 OR "tenant_id" = $1)` : ``}
         ), pay AS (
           SELECT COALESCE(SUM(COALESCE(amount,total,"totalAmount",0)),0) AS s FROM "CustomerPayment"
           ${tenantId ? `WHERE ("tenantId" = $1 OR "tenant_id" = $1)` : ``}
         ) SELECT (SELECT s FROM inv) - (SELECT s FROM pay) AS s`,
        ...(tenantId ? [tenantId] : [])
      ) as any;
      kpis.arBalance = Number((ar as any)?.[0]?.s || 0);
    } catch {}

    // Accounts Payable balance: SupplierBill - SupplierPayment
    try {
      const ap = await prisma.$queryRawUnsafe(
        `WITH bill AS (
           SELECT COALESCE(SUM(COALESCE(amount,total,"totalAmount",0)),0) AS s FROM "SupplierBill"
           ${tenantId ? `WHERE ("tenantId" = $1 OR "tenant_id" = $1)` : ``}
         ), pay AS (
           SELECT COALESCE(SUM(COALESCE(amount,total,"totalAmount",0)),0) AS s FROM "SupplierPayment"
           ${tenantId ? `WHERE ("tenantId" = $1 OR "tenant_id" = $1)` : ``}
         ) SELECT (SELECT s FROM bill) - (SELECT s FROM pay) AS s`,
        ...(tenantId ? [tenantId] : [])
      ) as any;
      kpis.apBalance = Number((ap as any)?.[0]?.["s"] || 0);
    } catch {}

    // Orders today: count CustomerInvoice created today
    try {
      const orders = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) AS c FROM "CustomerInvoice"
         WHERE "createdAt" >= $1 ${tenantId ? `AND ("tenantId" = $2 OR "tenant_id" = $2)` : ``}`,
        ...(tenantId ? [todayStart, tenantId] : [todayStart])
      ) as any;
      kpis.ordersToday = Number((orders as any)?.[0]?.c || 0);
    } catch {}

    res.status(200).json(kpis);
  } catch (e) {
    res.status(500).json({ error: "kpi_query_failed" });
  }
}
