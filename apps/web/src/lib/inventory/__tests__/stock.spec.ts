import { describe, it, expect } from "vitest";
import { aggregateByBin, type BinStockRow } from "@/lib/inventory/stock";

describe("inventory.aggregateByBin", () => {
  it("aggregates quantities by warehouse+bin+sku", () => {
    const rows: BinStockRow[] = [
      { sku: "A", warehouseId: "W1", locationId: "L1", qtyMinor: 5 },
      { sku: "A", warehouseId: "W1", locationId: "L1", qtyMinor: 3 },
      { sku: "A", warehouseId: "W1", locationId: "L2", qtyMinor: 2 },
      { sku: "B", warehouseId: "W1", locationId: "L1", qtyMinor: 7 },
    ];
    const out = aggregateByBin(rows);
    const byKey = (w?: string | null, l?: string | null, s?: string) =>
      out.find((r) => r.warehouseId === w && r.locationId === l && r.sku === s)?.qtyMinor ?? 0;
    expect(byKey("W1", "L1", "A")).toEqual(8);
    expect(byKey("W1", "L2", "A")).toEqual(2);
    expect(byKey("W1", "L1", "B")).toEqual(7);
  });
});


