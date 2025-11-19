export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function MrpPage() {
  const net = await fetchJson("/api/manufacturing/mrp/net-requirements?horizonDays=30");
  const planned = await fetchJson("/api/manufacturing/mrp/planned-orders?horizonDays=30");
  const netRows = net?.ok ? net.data : [];
  const poRows = planned?.ok ? planned.data : [];
  return (
    <Page title="Manufacturing • MRP">
      <div className="grid gap-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">Net Requirements (30 days)</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Demand</th>
                  <th className="py-2 pr-4">On hand</th>
                  <th className="py-2 pr-4">Net</th>
                </tr>
              </thead>
              <tbody>
                {netRows.map((r: any, i: number) => (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="py-2 pr-4">{r.itemCode}</td>
                    <td className="py-2 pr-4">{r.demand}</td>
                    <td className="py-2 pr-4">{r.onHand}</td>
                    <td className="py-2 pr-4">{r.netRequirement}</td>
                  </tr>
                ))}
                {!netRows?.length && <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No requirements.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">Planned Orders (suggestions only)</div>
          <div className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>Suggestions are read-only; no orders are persisted in this phase.</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Due</th>
                  <th className="py-2 pr-4">Source</th>
                </tr>
              </thead>
              <tbody>
                {poRows.map((r: any, i: number) => (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="py-2 pr-4">{r.itemCode}</td>
                    <td className="py-2 pr-4">{r.suggestedQtyMinor}</td>
                    <td className="py-2 pr-4">{new Date(r.dueDate).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{r.source}</td>
                  </tr>
                ))}
                {!poRows?.length && <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No planned orders.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
}


