import Link from "next/link";
import Page from "@/components/layout/Page";

export default async function DashboardPage() {
  let data: any = null;
  try {
    const res = await fetch(`/api/dashboard/kpis?months=12`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    data = { totals: { invoicesTotal: 0, billsTotal: 0, receiptsTotal: 0, posTotal: 0, payrollTotal: 0 }, series: [] };
  }
  const totals = data.totals as { invoicesTotal: number; billsTotal: number; receiptsTotal: number; posTotal: number; payrollTotal: number };
  const kpis = { revenue: Math.round((totals.invoicesTotal + totals.posTotal) * 100) / 100, bills: Math.round(totals.billsTotal * 100) / 100, receipts: Math.round(totals.receiptsTotal * 100) / 100 };
  const recentInvoices: any[] = [];
  const recentBills: any[] = [];

  return (
    <Page title="Dashboard">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 shadow border">
          <div className="text-sm text-gray-500">Revenue</div>
          <div className="text-2xl font-bold">£{kpis.revenue.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl p-4 shadow border">
          <div className="text-sm text-gray-500">Bills</div>
          <div className="text-2xl font-bold">£{kpis.bills.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl p-4 shadow border">
          <div className="text-sm text-gray-500">Receipts</div>
          <div className="text-2xl font-bold">{kpis.receipts}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="font-semibold mb-2">Recent Invoices</h2>
          <ul className="space-y-2">
            {recentInvoices.map((r, i) => (
              <li key={i} className="rounded-md border p-3 flex justify-between">
                <span>{r.number}</span>
                <span>£{Number(r.total ?? 0).toLocaleString()}</span>
              </li>
            ))}
            {recentInvoices.length === 0 && <div className="text-sm text-gray-500">No invoices yet.</div>}
          </ul>
        </section>
        <section>
          <h2 className="font-semibold mb-2">Recent Bills</h2>
          <ul className="space-y-2">
            {recentBills.map((r, i) => (
              <li key={i} className="rounded-md border p-3 flex justify-between">
                <span>{r.number}</span>
                <span>£{Number(r.total ?? 0).toLocaleString()}</span>
              </li>
            ))}
            {recentBills.length === 0 && <div className="text-sm text-gray-500">No bills yet.</div>}
          </ul>
        </section>
      </div>

      <div className="text-sm text-gray-500">
        <Link href="/finance/invoices" className="underline">Go to Finance</Link>
      </div>
    </Page>
  );
}
