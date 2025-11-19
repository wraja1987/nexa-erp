export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

function Card({ title, body }: { title: string; body: any }) {
  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border)" }}>
      <div className="font-medium mb-2">{title}</div>
      <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(body, null, 2)}</pre>
    </div>
  );
}

export default async function AnalyticsOverviewPage() {
  const data = await fetchJson("/api/analytics/kpi/all");
  const all = data?.data || {};
  return (
    <Page title="Analytics • Overview">
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Finance" body={all.finance || {}} />
        <Card title="Banking" body={all.banking || {}} />
        <Card title="HR" body={all.hr || {}} />
        <Card title="Inventory" body={all.inventory || {}} />
        <Card title="Manufacturing" body={all.manufacturing || {}} />
        <Card title="Purchasing" body={all.purchasing || {}} />
        <Card title="Projects" body={all.projects || {}} />
        <Card title="Sales" body={all.sales || {}} />
        <Card title="POS" body={all.pos || {}} />
        <Card title="Tax" body={all.tax || {}} />
      </div>
    </Page>
  );
}


