export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function getTimesheets() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/hr/timesheets/list`, { cache: "no-store" });
  if (!res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function TimesheetsPage() {
  const { items } = await getTimesheets();
  return (
    <Page title="HR — Timesheets">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
            Schema gap: Timesheets are not stored yet. This view is read-only with no data; create/approve/post are disabled.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Employee</th>
                  <th className="text-left p-2">Hours</th>
                  <th className="text-left p-2">Project</th>
                </tr>
              </thead>
              <tbody>
                {(items || []).length === 0 ? (
                  <tr><td className="p-2" colSpan={4}>No timesheets found.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
}


