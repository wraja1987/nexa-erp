export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function TaxVatPage() {
  const summary = await fetchJson("/api/tax/vat/summary");
  const returnsList = await fetchJson("/api/tax/vat/returns/list");
  const canCreate = false; // unsupported on locked schema
  return (
    <Page title="Tax • VAT">
      <div className="grid gap-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">VAT Summary</div>
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(summary?.data ?? summary, null, 2)}</pre>
        </div>
        <div className="rounded-2xl border bg-white p-6 space-y-3" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium">VAT Returns</div>
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(returnsList?.data ?? returnsList, null, 2)}</pre>
          <button className="px-4 py-2 rounded-lg opacity-50 cursor-not-allowed border" disabled={!canCreate}>
            Create Draft Return (unsupported)
          </button>
        </div>
      </div>
    </Page>
  );
}


