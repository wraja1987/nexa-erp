import { describe, it, expect } from "vitest";
import * as projects from "@/server/projects/projects";
import * as timesheets from "@/server/projects/timesheets";
import * as billing from "@/server/projects/billing";
import * as profitability from "@/server/projects/profitability";

describe("projects/psa scaffolding", () => {
  it("project CRUD functions exist", () => {
    expect(typeof projects.listProjects).toBe("function");
    expect(typeof projects.getProject).toBe("function");
  });
  it("timesheet functions exist", () => {
    expect(typeof timesheets.listTimesheets).toBe("function");
    expect(typeof timesheets.createTimesheetEntry).toBe("function");
  });
  it("billing preview function exists", () => {
    expect(typeof billing.buildBillingPreview).toBe("function");
  });
  it("profitability functions exist and return structured JSON (mock scope)", async () => {
    const scope = { tenantId: "t1" };
    const wip = await profitability.getWipSummary(scope as any, "p1");
    const prof = await profitability.getProfitability(scope as any, "p1");
    expect(wip).toHaveProperty("supported");
    expect(prof).toHaveProperty("supported");
  });
});


