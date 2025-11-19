import { describe, it, expect } from "vitest";
import { computeScheduleForDocument, monthsBetween, monthKey } from "../revenue";

describe("revenue schedule", () => {
  it("instant recognition at invoice date", () => {
    const issued = new Date("2025-01-15T00:00:00Z");
    const s = computeScheduleForDocument(1000, issued, null, "INSTANT");
    expect(s).toEqual([{ period: monthKey(issued), amountMinor: 1000 }]);
  });
  it("linear over months between issued and due", () => {
    const issued = new Date("2025-01-15T00:00:00Z");
    const due = new Date("2025-03-20T00:00:00Z");
    const s = computeScheduleForDocument(300, issued, due, "OVER_TIME_SIMPLE");
    const keys = monthsBetween(issued, due);
    expect(s.length).toBe(keys.length);
    const sum = s.reduce((acc, r) => acc + r.amountMinor, 0);
    expect(sum).toBe(300);
  });
});


