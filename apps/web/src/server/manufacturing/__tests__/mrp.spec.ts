import { describe, it, expect } from "vitest";
import { calculateNetReqRows } from "@/lib/manufacturing/mrp";

describe("MRP net requirements", () => {
  it("computes max(0, demand - onHand)", () => {
    const out = calculateNetReqRows([
      { itemCode: "A", demandQtyMinor: 10, onHandQtyMinor: 4 },
      { itemCode: "B", demandQtyMinor: 3, onHandQtyMinor: 5 },
    ]);
    const a = out.find((r) => r.itemCode === "A")!;
    const b = out.find((r) => r.itemCode === "B")!;
    expect(a.netRequirement).toBe(6);
    expect(b.netRequirement).toBe(0);
  });
});


