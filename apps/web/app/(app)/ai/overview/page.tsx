export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

async function get(path: string) {
  const r = await fetch(path, { cache: "no-store" });
  try { return await r.json(); } catch { return { ok: false }; }
}

export default async function AiOverviewPage() {
  const [recon, gl, inv, pay, mgmt] = await Promise.all([
    get("/api/ai/finance/reconciliation"),
    get("/api/ai/finance/gl-anomalies"),
    get("/api/ai/inventory/anomalies"),
    get("/api/ai/hr/payroll-anomalies"),
    get("/api/ai/management/commentary"),
  ]);
  const Section = ({ title, body }: { title: string; body: any }) => (
    <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
      <div className="font-medium mb-2">{title}</div>
      <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(body, null, 2)}</pre>
    </div>
  );
  return (
    <Page title="AI • Overview">
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Finance Reconciliation Suggestions" body={recon?.data ?? recon} />
        <Section title="GL Anomalies" body={gl?.data ?? gl} />
        <Section title="Inventory Anomalies" body={inv?.data ?? inv} />
        <Section title="Payroll Anomalies" body={pay?.data ?? pay} />
        <Section title="Management Commentary" body={mgmt?.data ?? mgmt} />
      </div>
    </Page>
  );
}


