export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function PosReportsPage() {
  const z = await fetchJson("/api/pos/reports/z");
  const x = await fetchJson("/api/pos/reports/x");
  return (
    <Page title="POS • Reports (Z / X)">
      <div className="grid gap-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">Z Report</div>
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(z?.data ?? z, null, 2)}</pre>
        </div>
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">X Report</div>
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(x?.data ?? x, null, 2)}</pre>
        </div>
      </div>
    </Page>
  );
}


