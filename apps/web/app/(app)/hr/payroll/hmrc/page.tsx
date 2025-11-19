export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function PayrollHmrcPage({ searchParams }: { searchParams: any }) {
  const runId = String(searchParams?.runId || "");
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const href = runId ? `${base}/api/hr/payroll/hmrc/export?runId=${encodeURIComponent(runId)}` : "";
  return (
    <Page title="HR — HMRC Export (Scaffolding)">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
            Export-only scaffolding. No live HMRC submission. Provide a Payroll Run ID to export the JSON payload.
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-sm col-span-2">
              Payroll Run ID
              <input className="block mt-1 border rounded-md px-2 py-1 w-full" defaultValue={runId} name="runId" />
            </label>
            <div className="flex items-end">
              <a className="px-4 py-2 rounded-lg text-white" style={{ background: "var(--color-blue)" }} href={href || "#"} onClick={(e) => { if (!href) e.preventDefault(); }}>
                Download JSON
              </a>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}


