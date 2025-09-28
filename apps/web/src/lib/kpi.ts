export type KPI = { key: string; label: string; value: number; trend?: number; currency?: string; };
export type DashboardKPIs = { kpis: KPI[] };
export async function loadDashboardKPIs(fallback: DashboardKPIs): Promise<DashboardKPIs> {
  try {
    const res = await fetch("/api/kpi/dashboard", { cache: "no-store" });
    if (!res.ok) throw new Error("bad");
    return await res.json();
  } catch {
    return fallback;
  }
}
