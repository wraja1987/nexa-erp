import { describe, it, expect } from "vitest";
import * as svc from "@/server/hr/employees";

describe("employees service (shape)", () => {
  it("exports expected functions", () => {
    expect(typeof svc.listEmployees).toBe("function");
    expect(typeof svc.getEmployee).toBe("function");
    expect(typeof svc.createEmployee).toBe("function");
    expect(typeof svc.updateEmployee).toBe("function");
    expect(typeof svc.deactivateEmployee).toBe("function");
  });
});


