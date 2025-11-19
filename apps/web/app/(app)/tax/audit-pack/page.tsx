export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function TaxAuditPackPage() {
  const data = await fetchJson("/api/tax/audit-pack");
  const json = data?.data ?? data;
  return (
    <Page title="Tax • Audit Pack">
      <div className="rounded-2xl border bg-white p-6 space-y-3" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm" style={{ color: "var(--color-muted)" }}>
          Read-only JSON; sections indicate supported:false when schema gaps prevent inclusion.
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(json, null, 2)}</pre>
      </div>
    </Page>
  );
}


