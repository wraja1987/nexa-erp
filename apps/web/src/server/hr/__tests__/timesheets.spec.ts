import { describe, it, expect } from "vitest";
import * as svc from "@/server/hr/timesheets";

describe("timesheets service (shape)", () => {
  it("exports expected functions", () => {
    expect(typeof svc.listTimesheets).toBe("function");
    expect(typeof svc.createTimesheetEntry).toBe("function");
    expect(typeof svc.approveTimesheet).toBe("function");
  });
});


