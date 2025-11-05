import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { monthStartUTC, addMonthsUTC, ymUTC } from "@/lib/time/months";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { getLimiter, keyFromReq } from "@/lib/rate-limit";

function clampMonths(n: number) { if (n < 1) return 1; if (n > 24) return 24; return n|0; }

export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const limiter = getLimiter('kpi_api', 60, 60_000);
  const token = await getToken({ req: req as any, secret });
  const tenantId = (token as any)?.tenantId ?? (token as any)?.tenant_id ?? "00000000-0000-0000-0000-000000000000";
  const userKey = keyFromReq(req, (token as any)?.id ?? null);
  if (!limiter.allow(userKey)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const url = new URL(req.url);
  const qSchema = z.object({ months: z.string().optional() });
  const parsedQ = qSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQ.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 });
  const rawMonths = parsedQ.data.months ? Number(parsedQ.data.months) : 12;
  if (!Number.isFinite(rawMonths)) return NextResponse.json({ error: 'invalid_months' }, { status: 400 });
  const monthsCount = clampMonths(Math.floor(rawMonths));

  const now = new Date();
  const months: Date[] = [];
  for (let i = monthsCount - 1; i >= 0; i--) months.push(monthStartUTC(now.getUTCFullYear(), now.getUTCMonth() - i));

  const series = [] as any[];
  const from0 = months[0];
  const to0 = addMonthsUTC(months[months.length - 1], 1);

  const client = await pool.connect();
  try {
    const span = Sentry.startSpan({ name: 'kpi_api', op: 'http.server', attributes: { tenantId, monthsCount } });
    const q = async (sql: string) => client.query(sql, [tenantId, from0, to0]).then(r => r.rows);
    const [invRows, billRows, recRows, posRows, payRows] = await Promise.all([
      q('select date_trunc(\'month\', "issuedAt") m, coalesce(sum(total),0) v from "CustomerInvoice" where "tenantId"=$1 and "issuedAt">=$2 and "issuedAt"<$3 group by 1 order by 1'),
      q('select date_trunc(\'month\', "receivedAt") m, coalesce(sum(total),0) v from "SupplierBill" where "tenantId"=$1 and "receivedAt">=$2 and "receivedAt"<$3 group by 1 order by 1'),
      q('select date_trunc(\'month\', "paidAt") m, coalesce(sum(amount),0) v from "CustomerPayment" where "tenantId"=$1 and "paidAt">=$2 and "paidAt"<$3 group by 1 order by 1'),
      q('select date_trunc(\'month\', "createdAt") m, coalesce(sum(total),0) v from "PosSale" where "tenantId"=$1 and "createdAt">=$2 and "createdAt"<$3 group by 1 order by 1'),
      q('select date_trunc(\'month\', "createdAt") m, coalesce(sum("netPay"),0) v from "Payslip" where "tenantId"=$1 and "createdAt">=$2 and "createdAt"<$3 group by 1 order by 1').catch(()=>[] as any[]),
    ]);

    const toMap = (rows: any[]) => Object.fromEntries(rows.map(r => [ymUTC(new Date(r.m)), Number(r.v)]));
    const invMap = toMap(invRows);
    const billMap = toMap(billRows);
    const recMap = toMap(recRows);
    const posMap = toMap(posRows);
    const payMap = toMap(payRows);

    for (const d of months) {
      const key = ymUTC(d);
      series.push({
        month: key,
        invoicesTotal: invMap[key] || 0,
        billsTotal: billMap[key] || 0,
        receiptsTotal: recMap[key] || 0,
        posTotal: posMap[key] || 0,
        payrollTotal: payMap[key] || 0,
      });
    }
    span.end();
  } finally {
    client.release();
  }

  const totals = series.reduce((acc, m) => ({
    invoicesTotal: acc.invoicesTotal + m.invoicesTotal,
    billsTotal: acc.billsTotal + m.billsTotal,
    receiptsTotal: acc.receiptsTotal + m.receiptsTotal,
    posTotal: acc.posTotal + m.posTotal,
    payrollTotal: acc.payrollTotal + m.payrollTotal,
  }), { invoicesTotal: 0, billsTotal: 0, receiptsTotal: 0, posTotal: 0, payrollTotal: 0 });

  const respSchema = z.object({
    tenantId: z.string(),
    series: z.array(z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
      invoicesTotal: z.number(),
      billsTotal: z.number(),
      receiptsTotal: z.number(),
      posTotal: z.number(),
      payrollTotal: z.number(),
    })),
    totals: z.object({
      invoicesTotal: z.number(),
      billsTotal: z.number(),
      receiptsTotal: z.number(),
      posTotal: z.number(),
      payrollTotal: z.number(),
    }),
  });
  const payload = { tenantId, series, totals };
  const ok = respSchema.safeParse(payload);
  if (!ok.success) return NextResponse.json({ error: 'bad_response' }, { status: 500 });
  return NextResponse.json(ok.data);
}


