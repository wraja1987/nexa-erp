export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function PosCashupPage() {
  const res = await fetch("/api/pos/cashup/preview", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  return (
    <Page title="POS • Cash-up">
      <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
        {!json?.ok ? (
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>Unable to load cash-up preview.</div>
        ) : (
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(json.data, null, 2)}</pre>
        )}
        <button className="px-4 py-2 rounded-lg opacity-50 cursor-not-allowed border" disabled>
          Submit Cash-up (unsupported)
        </button>
      </div>
    </Page>
  );
}


