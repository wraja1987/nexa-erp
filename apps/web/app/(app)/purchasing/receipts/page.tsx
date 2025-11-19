export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function ReceiptsPage() {
  const res = await fetch("/api/purchasing/receipts/list", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  const rows = json?.ok ? json.data : [];
  return (
    <Page title="Purchasing • Receipts (ASN)">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
          Receiving against PO is not implemented due to schema gaps; this is a read-only ASN view.
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">ASN Number</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">ETA</th>
                <th className="py-2 pr-4">Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4">{r.number}</td>
                  <td className="py-2 pr-4">{r.status}</td>
                  <td className="py-2 pr-4">{r.eta ? new Date(r.eta).toLocaleDateString() : "—"}</td>
                  <td className="py-2 pr-4">{r.receivedAt ? new Date(r.receivedAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {!rows?.length && (
                <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No ASNs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}


