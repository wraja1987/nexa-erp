import Page from "@/components/layout/Page";

async function getAlerts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/ai/audit/logs`, { cache: "no-store" });
    if (!res.ok) return [] as any[];
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 20) : [];
  } catch {
    return [] as any[];
  }
}

export default async function AlertsPage() {
  const alerts = await getAlerts();
  return (
    <Page title="Alerts">
      <div className="col-span-12">
        <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--color-muted)" }}>Recent Activity</div>
          <ul className="mt-3 divide-y" style={{ borderColor: "var(--border)" }}>
            {alerts.length === 0 && (
              <li className="py-3 text-sm" style={{ color: "var(--color-muted)" }}>No alerts yet.</li>
            )}
            {alerts.map((a: any) => (
              <li key={a.id || a.at || Math.random()} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.event || a.route || "AI action"}</div>
                  <div className="text-xs" style={{ color: "var(--color-muted)" }}>{a.email || a.user || "system"} · {new Date(a.created_at || a.at || Date.now()).toLocaleString()}</div>
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>{a.status || a.provider || "ok"}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Page>
  );
}
