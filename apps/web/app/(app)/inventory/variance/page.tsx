export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function VariancePage() {
  const res = await fetch("/api/inventory/variance/list", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  const rows = json?.ok ? json.data : [];
  return (
    <Page title="Inventory • Variances">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
          Variance posting is not implemented due to missing variance ledger; view will list recorded variances when available.
        </div>
        {rows?.length ? (
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(rows, null, 2)}</pre>
        ) : (
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>No variances found.</div>
        )}
      </div>
    </Page>
  );
}


