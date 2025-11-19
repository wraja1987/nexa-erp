import { describe, it, expect } from "vitest";
import { calculatePayeeTax, calculateNi, calculatePension } from "@/lib/hr/uk-payroll";

describe("UK Payroll calculators (safe subset)", () => {
  it("returns 0 for PAYE/NI/Pension with no config", () => {
    const period = { start: new Date("2025-01-01"), end: new Date("2025-01-31") };
    expect(calculatePayeeTax(100000, {}, period)).toBe(0);
    expect(calculateNi(100000, {}, period)).toBe(0);
    expect(calculatePension(100000, {}, period)).toBe(0);
  });
});


