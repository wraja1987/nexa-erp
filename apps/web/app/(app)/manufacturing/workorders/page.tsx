export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function WorkOrdersPage() {
  const list = await fetchJson("/api/manufacturing/workorders/list");
  const rows = list?.ok ? list.data : [];
  return (
    <Page title="Manufacturing • Work Orders">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">WO Number</th>
                <th className="py-2 pr-4">Item</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4">{r.number}</td>
                  <td className="py-2 pr-4">{r.itemCode}</td>
                  <td className="py-2 pr-4">{Number(r.quantity || 0)}</td>
                  <td className="py-2 pr-4">{r.status}</td>
                </tr>
              ))}
              {!rows?.length && (
                <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No work orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}


