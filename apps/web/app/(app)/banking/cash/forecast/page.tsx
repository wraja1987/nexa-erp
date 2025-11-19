export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function getForecast() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/banking/cash/forecast`, { cache: "no-store" });
  if (!res.ok) return { data: { inflows: [] as any[], outflows: [] as any[], from: "", to: "" } };
  return res.json();
}

export default async function CashForecastPage() {
  const { data } = await getForecast();
  return (
    <Page title="Banking — Cash Forecast">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-6" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>Window: {data.from ? new Date(data.from).toLocaleDateString() : "—"} → {data.to ? new Date(data.to).toLocaleDateString() : "—"}</div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="font-medium mb-2">Expected Inflows (AR)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Invoice</th>
                      <th className="text-left p-2">Due</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.inflows || []).map((r: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2">{r.number}</td>
                        <td className="p-2">{r.dueAt ? new Date(r.dueAt).toLocaleDateString() : "—"}</td>
                        <td className="p-2">{Math.round(r.amountMinor)}</td>
                        <td className="p-2">{r.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Expected Outflows (AP)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Bill</th>
                      <th className="text-left p-2">Due</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.outflows || []).map((r: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2">{r.number}</td>
                        <td className="p-2">{r.dueAt ? new Date(r.dueAt).toLocaleDateString() : "—"}</td>
                        <td className="p-2">{Math.round(r.amountMinor)}</td>
                        <td className="p-2">{r.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}


