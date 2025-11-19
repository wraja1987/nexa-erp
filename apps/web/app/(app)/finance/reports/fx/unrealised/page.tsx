import Page from "@/components/layout/Page";

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/finance/reports/fx/unrealised`, { cache: "no-store" });
  if (!res.ok) return { ok: false, items: [], note: "failed" } as any;
  return res.json();
}

export default async function UnrealisedFxPage() {
  const data = await getData();
  return (
    <Page title="FX — Unrealised">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
            {data?.note || "Tenant-level remeasurement (read-only)."}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Doc ID</th>
                  <th className="text-left p-2">Tx Currency</th>
                  <th className="text-left p-2">Tx Total</th>
                  <th className="text-left p-2">Functional</th>
                  <th className="text-left p-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items || []).map((i: any) => (
                  <tr key={`${i.type}-${i.id}`}>
                    <td className="p-2">{i.type}</td>
                    <td className="p-2">{i.id}</td>
                    <td className="p-2">{i.txCurrency}</td>
                    <td className="p-2">{i.txTotal}</td>
                    <td className="p-2">
                      {i.functionalCurrency} {Math.round(i.functionalAmount)}
                    </td>
                    <td className="p-2">{i.rate}</td>
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


