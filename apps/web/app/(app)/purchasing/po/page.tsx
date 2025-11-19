export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function PurchaseOrdersPage() {
  const res = await fetch("/api/purchasing/po/list", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  const rows = json?.ok ? json.data : [];
  return (
    <Page title="Purchasing • Purchase Orders">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">PO Number</th>
                <th className="py-2 pr-4">Supplier</th>
                <th className="py-2 pr-4">Currency</th>
                <th className="py-2 pr-4">Order Date</th>
                <th className="py-2 pr-4">Expected</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4">{r.number}</td>
                  <td className="py-2 pr-4">{r.supplier?.name || "—"}</td>
                  <td className="py-2 pr-4">{r.currency}</td>
                  <td className="py-2 pr-4">{new Date(r.orderDate).toLocaleDateString()}</td>
                  <td className="py-2 pr-4">{r.expectedAt ? new Date(r.expectedAt).toLocaleDateString() : "—"}</td>
                  <td className="py-2 pr-4">{r.status}</td>
                </tr>
              ))}
              {!rows?.length && (
                <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No purchase orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}


