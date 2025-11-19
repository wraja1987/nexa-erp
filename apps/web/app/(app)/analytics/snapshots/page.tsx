export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function AnalyticsSnapshotsPage() {
  const data = await fetchJson("/api/analytics/etl/snapshot?type=daily");
  return (
    <Page title="Analytics • Snapshots">
      <div className="rounded-2xl border bg-white p-6 space-y-3" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm" style={{ color: "var(--color-muted)" }}>
          Snapshots are not persisted (no metrics store). This is a one-time preview only.
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(data?.data ?? data, null, 2)}</pre>
      </div>
    </Page>
  );
}


