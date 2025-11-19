export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

type Params = { params: { module: string } };

export default async function AnalyticsModulePage({ params }: Params) {
  const m = (params?.module || "").toLowerCase();
  const data = await fetchJson(`/api/analytics/kpi/module?module=${encodeURIComponent(m)}`);
  const body = data?.data || { supported: false, message: "unknown module" };
  return (
    <Page title={`Analytics • ${m || "module"}`}>
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(body, null, 2)}</pre>
      </div>
    </Page>
  );
}


