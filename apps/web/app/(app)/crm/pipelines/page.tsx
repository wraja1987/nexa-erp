export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function CrmPipelinesPage() {
  const stagesRes = await fetch("/api/crm/pipelines/list", { cache: "no-store" });
  const oppRes = await fetch("/api/crm/opportunities/list", { cache: "no-store" });
  const stages = (await stagesRes.json().catch(() => ({ ok: false })))?.data || [];
  const opps = (await oppRes.json().catch(() => ({ ok: false })))?.data || [];
  return (
    <Page title="CRM • Pipelines">
      <div className="rounded-2xl border bg-white p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm" style={{ color: "var(--color-muted)" }}>
          Opportunity/Pipeline models are not present in schema; create/update/move return 501.
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="font-medium mb-2">Stages</div>
            <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(stages, null, 2)}</pre>
          </div>
          <div>
            <div className="font-medium mb-2">Opportunities</div>
            <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(opps, null, 2)}</pre>
          </div>
        </div>
      </div>
    </Page>
  );
}


