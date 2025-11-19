import { describe, it, expect } from "vitest";
import * as svc from "@/server/hr/payroll";
import * as journals from "@/server/hr/payroll-journals";
import * as hmrc from "@/server/hr/hmrc";

describe("payroll modules (shape)", () => {
  it("exports expected payroll functions", () => {
    expect(typeof svc.listPayrollRuns).toBe("function");
    expect(typeof svc.buildPayRun).toBe("function");
    expect(typeof svc.commitPayRun).toBe("function");
  });
  it("exports payroll journal funcs", () => {
    expect(typeof journals.postPayrollJournal).toBe("function");
  });
  it("exports hmrc funcs", () => {
    expect(typeof hmrc.buildHmrcSubmissionPayload).toBe("function");
    expect(typeof hmrc.exportHmrcFile).toBe("function");
  });
});


