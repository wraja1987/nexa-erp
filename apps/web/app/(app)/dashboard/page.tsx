import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any);
  if (!session?.user) {
    return (
      <meta httpEquiv="refresh" content="0; url=/login?callbackUrl=/dashboard" />
    );
  }

  const tenantId = (session.user as any).tenant_id ?? "root";

  let kpis = { revenue: 0, bills: 0, receipts: 0 };
  let recentInvoices: any[] = [];
  let recentBills: any[] = [];

  try {
    const [invSum, billSum, recCount] = await Promise.all([
      prisma.customerInvoice.aggregate({ _sum: { total: true }, where: { tenantId } }),
      prisma.supplierBill.aggregate({ _sum: { total: true }, where: { tenantId } }),
      prisma.customerPayment.count({ where: { tenantId } }),
    ]);

    kpis = {
      revenue: Number(invSum._sum.total ?? 0),
      bills: Number(billSum._sum.total ?? 0),
      receipts: recCount ?? 0,
    };

    [recentInvoices, recentBills] = await Promise.all([
      prisma.customerInvoice.findMany({
        where: { tenantId },
        orderBy: { issuedAt: "desc" },
        take: 5,
        select: { number: true, total: true, status: true, issuedAt: true },
      }),
      prisma.supplierBill.findMany({
        where: { tenantId },
        orderBy: { receivedAt: "desc" },
        take: 5,
        select: { number: true, total: true, status: true, receivedAt: true },
      }),
    ]);
  } catch (e) {
    console.error("[dashboard] query error", e);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

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
    </div>
  );
}
