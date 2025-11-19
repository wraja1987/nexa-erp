export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function SalesChainsPage() {
  const q2oPrev = await fetchJson("/api/sales/quote-to-order/preview");
  const o2iPrev = await fetchJson("/api/sales/order-to-invoice/preview");
  return (
    <Page title="Sales • Chains">
      <div className="grid gap-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">Quote → Order Preview</div>
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(q2oPrev, null, 2)}</pre>
        </div>
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">Order → Invoice Preview</div>
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(o2iPrev, null, 2)}</pre>
        </div>
      </div>
    </Page>
  );
}


