import { describe, it, expect } from "vitest";
import * as kpi from "@/server/analytics/kpi";
import * as metrics from "@/server/analytics/metrics";
import * as etl from "@/server/analytics/etl";

describe("Analytics scaffolding", () => {
  it("kpi exports exist", () => {
    expect(typeof kpi.getAllKpis).toBe("function");
    expect(typeof kpi.getFinanceKpis).toBe("function");
    expect(typeof kpi.getBankingKpis).toBe("function");
    expect(typeof kpi.getHrKpis).toBe("function");
    expect(typeof kpi.getInventoryKpis).toBe("function");
  });
  it("metrics adapter exists and returns schema-gap", async () => {
    const res = await metrics.queryMetrics();
    expect(res).toHaveProperty("supported");
  });
  it("etl snapshot returns structured object", async () => {
    const snap = await etl.runDailySnapshot({ tenantId: "t1" } as any);
    expect(snap).toHaveProperty("type");
    expect(snap).toHaveProperty("payload");
  });
});


