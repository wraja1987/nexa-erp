export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function BinsPage() {
  const res = await fetch("/api/inventory/bins/list", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  const rows = json?.ok ? json.data : [];
  return (
    <Page title="Inventory • Bins">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Warehouse</th>
                <th className="py-2 pr-4">Bin Code</th>
                <th className="py-2 pr-4">Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4">{r.warehouse?.code || "—"}</td>
                  <td className="py-2 pr-4">{r.code}</td>
                  <td className="py-2 pr-4">{r.type || "—"}</td>
                </tr>
              ))}
              {!rows?.length && (
                <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No bins found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}


