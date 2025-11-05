import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

function startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0); }
function addMonths(d: Date, n: number): Date { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function ym(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }

export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req: req as any, secret });
  const tenantId = (token as any)?.tenantId ?? (token as any)?.tenant_id ?? "00000000-0000-0000-0000-000000000000";

  const now = new Date();
  const months: Date[] = [];
  for (let i = 11; i >= 0; i--) months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));

  const series = [] as any[];
  for (let i = 0; i < months.length; i++) {
    const from = startOfMonth(months[i]);
    const to = startOfMonth(addMonths(from, 1));

    const client = await pool.connect();
    try {
      const inv = await client.query('select coalesce(sum(total),0) v from "CustomerInvoice" where "tenantId"=$1 and "issuedAt">=$2 and "issuedAt"<$3',[tenantId,from,to]);
      const bill = await client.query('select coalesce(sum(total),0) v from "SupplierBill" where "tenantId"=$1 and "receivedAt">=$2 and "receivedAt"<$3',[tenantId,from,to]);
      const rec = await client.query('select coalesce(sum(amount),0) v from "CustomerPayment" where "tenantId"=$1 and "paidAt">=$2 and "paidAt"<$3',[tenantId,from,to]);
      const pos = await client.query('select coalesce(sum(total),0) v from "PosSale" where "tenantId"=$1 and "createdAt">=$2 and "createdAt"<$3',[tenantId,from,to]);
      const pay = await client.query('select coalesce(sum("netPay"),0) v from "Payslip" where "tenantId"=$1 and "createdAt">=$2 and "createdAt"<$3',[tenantId,from,to]).catch(()=>({rows:[{v:0}]} as any));

    series.push({
      month: ym(from),
      invoicesTotal: Number(inv.rows[0].v),
      billsTotal: Number(bill.rows[0].v),
      receiptsTotal: Number(rec.rows[0].v),
      posTotal: Number(pos.rows[0].v),
      payrollTotal: Number(pay.rows[0].v),
    });
    } finally {
      client.release();
    }
  }

  const totals = series.reduce((acc, m) => ({
    invoicesTotal: acc.invoicesTotal + m.invoicesTotal,
    billsTotal: acc.billsTotal + m.billsTotal,
    receiptsTotal: acc.receiptsTotal + m.receiptsTotal,
    posTotal: acc.posTotal + m.posTotal,
    payrollTotal: acc.payrollTotal + m.payrollTotal,
  }), { invoicesTotal: 0, billsTotal: 0, receiptsTotal: 0, posTotal: 0, payrollTotal: 0 });

  return NextResponse.json({ tenantId, series, totals });
}


