export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function ManufacturingBomPage() {
  const listRes = await fetch("/api/manufacturing/bom/list", { cache: "no-store" });
  const listJson = await listRes.json().catch(() => ({ ok: false }));
  const groups = listJson?.ok ? listJson.data : [];
  return (
    <Page title="Manufacturing • BOM">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
          BOM is modelled as `BomItem` lines by parent item. Alternates/phantoms are not in schema and are documented as gaps.
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Parent Item</th>
                <th className="py-2 pr-4">Components</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g: any) => (
                <tr key={g.parentItemCode} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-4">{g.parentItemCode}</td>
                  <td className="py-2 pr-4">
                    {(g.components || []).map((c: any) => (
                      <span key={c.id} className="inline-block mr-3">{c.componentItemCode} × {Number(c.quantity || 0)}</span>
                    ))}
                  </td>
                </tr>
              ))}
              {!groups?.length && (
                <tr><td className="py-6 text-sm" style={{ color: "var(--color-muted)" }}>No BOM lines found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}
