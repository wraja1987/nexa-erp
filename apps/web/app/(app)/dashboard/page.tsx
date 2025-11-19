export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import KpiCard from "@/components/ui/KpiCard";

async function getDashboardData() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    const res = await fetch(`${base}/api/dashboard/kpis?months=12`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch {
    return { totals: { invoicesTotal: 0, billsTotal: 0, receiptsTotal: 0, posTotal: 0, payrollTotal: 0 }, series: [] };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const totals = data.totals as { invoicesTotal: number; billsTotal: number; receiptsTotal: number; posTotal: number; payrollTotal: number };
  const kpis = {
    revenue: Math.round((totals.invoicesTotal + totals.posTotal) * 100) / 100,
    bills: Math.round(totals.billsTotal * 100) / 100,
    receipts: Math.round(totals.receiptsTotal * 100) / 100,
  };
  const recentInvoices: any[] = [];
  const recentBills: any[] = [];

  return (
    <>
      <PageHeader title="Dashboard" />

      <main className="space-y-4 px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Revenue" value={`£${kpis.revenue.toLocaleString()}`} />
          <KpiCard title="Bills" value={`£${kpis.bills.toLocaleString()}`} />
          <KpiCard title="Receipts" value={kpis.receipts.toString()} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold mb-4">Recent Invoices</h2>
              <ul className="space-y-2">
                {recentInvoices.map((r, i) => (
                  <li key={i} className="rounded-md border p-3 flex justify-between">
                    <span>{r.number}</span>
                    <span>£{Number(r.total ?? 0).toLocaleString()}</span>
                  </li>
                ))}
                {recentInvoices.length === 0 && (
                  <div className="text-sm" style={{ color: "#6b7280" }}>
                    No invoices yet.
                  </div>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold mb-4">Recent Bills</h2>
              <ul className="space-y-2">
                {recentBills.map((r, i) => (
                  <li key={i} className="rounded-md border p-3 flex justify-between">
                    <span>{r.number}</span>
                    <span>£{Number(r.total ?? 0).toLocaleString()}</span>
                  </li>
                ))}
                {recentBills.length === 0 && (
                  <div className="text-sm" style={{ color: "#6b7280" }}>
                    No bills yet.
                  </div>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-sm" style={{ color: "#6b7280" }}>
          <Link href="/finance/invoices" className="underline hover:opacity-70">
            Go to Finance
          </Link>
        </div>
      </main>
    </>
  );
}
