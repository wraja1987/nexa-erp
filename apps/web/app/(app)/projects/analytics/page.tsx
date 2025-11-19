export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  try { return await res.json(); } catch { return { ok: false }; }
}

export default async function ProjectsAnalyticsPage() {
  const wip = await fetchJson("/api/projects/wip?projectId=dummy");
  const prof = await fetchJson("/api/projects/profitability?projectId=dummy");
  return (
    <Page title="Projects • Analytics">
      <div className="grid gap-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">WIP Summary</div>
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(wip?.data ?? wip, null, 2)}</pre>
        </div>
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="font-medium mb-2">Profitability</div>
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(prof?.data ?? prof, null, 2)}</pre>
        </div>
      </div>
    </Page>
  );
}


