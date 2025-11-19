export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function SupplierPerformancePage() {
  const res = await fetch("/api/purchasing/performance", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  return (
    <Page title="Purchasing • Supplier Performance">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm" style={{ color: "var(--color-muted)" }}>
          {json?.message || "No performance data available."}
        </div>
      </div>
    </Page>
  );
}


