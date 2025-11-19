import Page from "@/components/layout/Page";

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/finance/reports/fx/realised`, { cache: "no-store" });
  if (!res.ok) return { ok: false, items: [], note: "failed" } as any;
  return res.json();
}

export default async function RealisedFxPage() {
  const data = await getData();
  return (
    <Page title="FX — Realised (Read-only)">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>
            {data?.note || "Schema gap: payment currency required for realised FX. Report is empty by design."}
          </div>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
            Items: {(data?.items || []).length} · Gain: {data?.totals?.gain ?? 0} · Loss: {data?.totals?.loss ?? 0}
          </div>
        </div>
      </div>
    </Page>
  );
}


