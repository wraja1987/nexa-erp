import Page from "@/components/layout/Page";

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/finance/reports/ap-ar/payables-aging`, { cache: "no-store" });
  if (!res.ok) return { ok: false, items: [], totals: {} } as any;
  return res.json();
}

export default async function PayablesAgingPage() {
  const data = await getData();
  const totals = data?.totals || {};
  return (
    <Page title="Payables Aging">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
            Tenant-level AP aging (read-only)
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {["0-30", "31-60", "61-90", "90+"].map((b) => (
              <div key={b} className="border rounded-xl p-3" style={{ borderColor: "var(--border)" }}>
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>{b}</div>
                <div className="font-medium">{Math.round(Number(totals[b] || 0))}</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Number</th>
                  <th className="text-left p-2">Currency</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Paid</th>
                  <th className="text-left p-2">Balance</th>
                  <th className="text-left p-2">Due</th>
                  <th className="text-left p-2">Days</th>
                  <th className="text-left p-2">Bucket</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items || []).map((r: any) => (
                  <tr key={r.id}>
                    <td className="p-2">{r.number}</td>
                    <td className="p-2">{r.currency}</td>
                    <td className="p-2">{r.total}</td>
                    <td className="p-2">{r.paid}</td>
                    <td className="p-2">{r.balance}</td>
                    <td className="p-2">{r.due}</td>
                    <td className="p-2">{r.days}</td>
                    <td className="p-2">{r.bucket}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
}


