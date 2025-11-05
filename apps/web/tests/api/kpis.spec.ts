/* eslint-disable no-console */
import fetch from 'node-fetch';
import { Client } from 'pg';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function computeDbTotals(tenantId: string) {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    const months: string[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0');
      months.push(`${y}-${m}`);
    }
    const res = [] as any[];
    for (const ym of months) {
      const [y, m] = ym.split('-').map(Number);
      const from = new Date(y, (m-1), 1);
      const to = new Date(y, (m-1)+1, 1);
      const inv = await db.query('select coalesce(sum(total),0) v from "CustomerInvoice" where "tenantId"=$1 and "issuedAt">=$2 and "issuedAt"<$3',[tenantId,from,to]);
      const bill = await db.query('select coalesce(sum(total),0) v from "SupplierBill" where "tenantId"=$1 and "receivedAt">=$2 and "receivedAt"<$3',[tenantId,from,to]);
      const rec = await db.query('select coalesce(sum(amount),0) v from "CustomerPayment" where "tenantId"=$1 and "paidAt">=$2 and "paidAt"<$3',[tenantId,from,to]);
      const pos = await db.query('select coalesce(sum(total),0) v from "PosSale" where "tenantId"=$1 and "createdAt">=$2 and "createdAt"<$3',[tenantId,from,to]);
      const pay = await db.query('select coalesce(sum("netPay"),0) v from "Payslip" where "tenantId"=$1 and "createdAt">=$2 and "createdAt"<$3',[tenantId,from,to]).catch(()=>({rows:[{v:0}]} as any));
      res.push({ month: ym, invoicesTotal: Number(inv.rows[0].v), billsTotal: Number(bill.rows[0].v), receiptsTotal: Number(rec.rows[0].v), posTotal: Number(pos.rows[0].v), payrollTotal: Number(pay.rows[0].v)});
    }
    const totals = res.reduce((a,b)=>({
      invoicesTotal: a.invoicesTotal + b.invoicesTotal,
      billsTotal: a.billsTotal + b.billsTotal,
      receiptsTotal: a.receiptsTotal + b.receiptsTotal,
      posTotal: a.posTotal + b.posTotal,
      payrollTotal: a.payrollTotal + b.payrollTotal,
    }), { invoicesTotal:0,billsTotal:0,receiptsTotal:0,posTotal:0,payrollTotal:0 });
    return { series: res, totals };
  } finally {
    await db.end();
  }
}

describe('Dashboard KPI API', () => {
  it('matches DB-computed totals for super-admin tenant', async () => {
    // Login to get cookie
    const csrfResp = await fetch(`${BASE}/api/auth/csrf`, { redirect: 'manual' });
    const csrfJson = await csrfResp.json() as any;
    const csrf = csrfJson.csrfToken;
    const cookies = csrfResp.headers.get('set-cookie') || '';
    const loginResp = await fetch(`${BASE}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookies },
      body: new URLSearchParams({ csrfToken: csrf, email: 'info@nexaai.co.uk', password: 'NexaSuper!123' }) as any,
      redirect: 'manual'
    });
    const cookie = loginResp.headers.get('set-cookie') || '';

    const resp = await fetch(`${BASE}/api/dashboard/kpis`, { headers: { Cookie: cookie } });
    expect(resp.ok).toBeTruthy();
    const body = await resp.json();
    const tenantId = body.tenantId as string;
    const expected = await computeDbTotals(tenantId);

    expect(body.totals).toEqual(expected.totals);
    expect(body.series.length).toBe(12);
  });
});


