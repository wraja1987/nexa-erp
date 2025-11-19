export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";

export default async function CrmActivitiesPage() {
  const res = await fetch("/api/crm/activities/list", { cache: "no-store" });
  const json = await res.json().catch(() => ({ ok: false }));
  const rows = json?.ok ? json.data : [];
  return (
    <Page title="CRM • Activities">
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
          CRM Activities model is not present in schema; create/complete endpoints return 501.
        </div>
        {rows?.length ? (
          <pre className="text-xs bg-gray-50 p-3 rounded-md">{JSON.stringify(rows, null, 2)}</pre>
        ) : (
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>No activities available.</div>
        )}
      </div>
    </Page>
  );
}


