export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function WorkCentersPage() {
  const res = await fetch("/api/manufacturing/workcenters/list", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  const rows = json?.ok ? json.data : [];
  return (
    <Page title="Manufacturing • Work Centers">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
          Derived from CapacityCalendar and RoutingStep.resourceCode. Create/update is not supported in this schema (501).
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Resource Code</th>
                <th className="py-2 pr-4">Available Minutes (sum)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.code} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4">{r.code}</td>
                  <td className="py-2 pr-4">{r.availableMins}</td>
                </tr>
              ))}
              {!rows?.length && (
                <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No work centers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}


