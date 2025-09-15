import { api, SIMULATE } from "../lib/api";
import { mockKpis } from "../mocks/data";
export type Kpis = { glBalance:number; stockUnits:number; workOrders:number; insight:string; };
export async function fetchDashboardKpis(): Promise<Kpis>{
  if (SIMULATE) return mockKpis;
  const { data } = await api.get("/api/analytics/kpis");
  return {
    glBalance: data?.glBalance ?? 0,
    stockUnits: data?.stockUnits ?? 0,
    workOrders: data?.workOrders ?? 0,
    insight: data?.insight ?? "No insight available."
  };
}
