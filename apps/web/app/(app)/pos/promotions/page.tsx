export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function PosPromotionsPage() {
  const res = await fetch("/api/pos/promotions/list", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  const rows = json?.ok ? json.data : [];
  return (
    <Page title="POS • Promotions">
      <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm" style={{ color: "var(--color-muted)" }}>
          Promotions are not modeled; create/update are unsupported.
        </div>
        {rows?.length ? (
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(rows, null, 2)}</pre>
        ) : (
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>No promotions found.</div>
        )}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg opacity-50 cursor-not-allowed border" disabled>
            Create Promotion (unsupported)
          </button>
          <button className="px-4 py-2 rounded-lg opacity-50 cursor-not-allowed border" disabled>
            Update Promotion (unsupported)
          </button>
        </div>
      </div>
    </Page>
  );
}


