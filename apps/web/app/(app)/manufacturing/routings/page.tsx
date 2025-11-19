export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function RoutingsPage() {
  const res = await fetch("/api/manufacturing/routings/list", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  const rows = json?.ok ? json.data : [];
  return (
    <Page title="Manufacturing • Routings">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
          Routing steps are attached to Work Orders (no routing master). Editing routings is not supported in this schema.
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">WO Number</th>
                <th className="py-2 pr-4">Item</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Steps</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4">{r.number}</td>
                  <td className="py-2 pr-4">{r.itemCode}</td>
                  <td className="py-2 pr-4">{r.status}</td>
                  <td className="py-2 pr-4">{r.stepCount}</td>
                </tr>
              ))}
              {!rows?.length && (
                <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No routings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}


