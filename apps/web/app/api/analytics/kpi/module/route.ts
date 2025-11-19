import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import {
  getFinanceKpis, getBankingKpis, getHrKpis, getInventoryKpis, getManufacturingKpis,
  getPurchasingKpis, getProjectsKpis, getSalesKpis, getPosKpis, getTaxKpis, getPlanningKpis
} from "@/server/analytics/kpi";

const handlers: Record<string, (s: { tenantId: string }) => Promise<any>> = {
  finance: (s) => getFinanceKpis(s),
  banking: (s) => getBankingKpis(s),
  hr: (s) => getHrKpis(s),
  inventory: (s) => getInventoryKpis(s),
  manufacturing: (s) => getManufacturingKpis(s),
  purchasing: (s) => getPurchasingKpis(s),
  projects: (s) => getProjectsKpis(s),
  sales: (s) => getSalesKpis(s),
  pos: (s) => getPosKpis(s),
  tax: (s) => getTaxKpis(s),
  planning: (s) => getPlanningKpis(s),
};

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:analytics:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const module = (searchParams.get("module") || "").toLowerCase();
  const fn = handlers[module];
  if (!fn) {
    return Response.json({ ok: true, data: { supported: false, message: "unknown module" } });
  }
  const data = await fn({ tenantId });
  return Response.json({ ok: true, data });
}


