import { describe, it, expect } from "vitest";
import { parseDimensionFilters, buildJournalLineWhereWithDimensions, buildInvoiceWhereWithDimensions } from "../dimensions";

describe("dimensions helper", () => {
  it("parses empty filters", () => {
    const s = new URLSearchParams();
    const f = parseDimensionFilters(s);
    expect(f.type).toBeUndefined();
    expect(f.values?.length || 0).toBe(0);
  });
  it("parses provided filters", () => {
    const s = new URLSearchParams();
    s.set("dimensionType", "department");
    s.set("dimensionValues", "dep1,dep2");
    const f = parseDimensionFilters(s);
    expect(f.type).toBe("department");
    expect(f.values).toEqual(["dep1", "dep2"]);
  });
  it("build where returns base where unchanged (schema gap)", () => {
    const base = { tenantId: "t1" };
    const filters = { type: "department" as any, values: ["x"] };
    expect(buildJournalLineWhereWithDimensions(base, filters)).toEqual(base);
    expect(buildInvoiceWhereWithDimensions(base, filters)).toEqual(base);
  });
});


