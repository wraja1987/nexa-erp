export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function TaxGccEinvoicePage() {
  const preview = await fetchJson("/api/tax/gcc-einvoice/preview?invoiceId=dummy");
  return (
    <Page title="Tax • GCC e-Invoice">
      <div className="rounded-2xl border bg-white p-6 space-y-3" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm" style={{ color: "var(--color-muted)" }}>
          Read-only preview from existing invoice data. Missing GCC-required fields are reported as schema gaps.
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(preview?.data ?? preview, null, 2)}</pre>
      </div>
    </Page>
  );
}


