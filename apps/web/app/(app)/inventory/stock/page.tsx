export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function StockPage() {
  const summary = await fetchJson("/api/inventory/stock/summary");
  const byBin = await fetchJson("/api/inventory/stock/by-bin");
  const summaryOk = summary?.ok && summary.data;
  const byBinOk = byBin?.ok && byBin.data;
  return (
    <Page title="Inventory • Stock">
      <div className="grid gap-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">Summary by Warehouse</div>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>Aggregated from InventoryItem balances.</div>
          <div className="mt-3">
            {summaryOk ? (
              <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-auto">{JSON.stringify(summary.data.byWarehouse, null, 2)}</pre>
            ) : (
              <div className="text-sm" style={{ color: "var(--color-muted)" }}>No data</div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">Stock by Bin</div>
          <div className="overflow-x-auto mt-3">
            {byBinOk ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-4">SKU</th>
                    <th className="py-2 pr-4">Warehouse</th>
                    <th className="py-2 pr-4">Bin</th>
                    <th className="py-2 pr-4">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {byBin.data.map((r: any, i: number) => (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="py-2 pr-4">{r.sku}</td>
                      <td className="py-2 pr-4">{r.warehouseCode || "—"}</td>
                      <td className="py-2 pr-4">{r.locationCode || "—"}</td>
                      <td className="py-2 pr-4">{r.qtyMinor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-sm" style={{ color: "var(--color-muted)" }}>No data</div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}


