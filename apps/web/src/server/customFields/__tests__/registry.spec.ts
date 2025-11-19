import { describe, it, expect } from "vitest";
import { getDefaultDefinitions, listSupportedEntityTypes, getDefinitionById } from "../registry";

describe("Custom Fields Registry", () => {
  it("lists supported entity types", () => {
    const types = listSupportedEntityTypes();
    expect(types.length).toBeGreaterThan(0);
    expect(types).toContain("finance.invoice");
    expect(types).toContain("purchasing.supplier");
    expect(types).toContain("inventory.item");
    expect(types).toContain("hr.employee");
  });

  it("returns definitions for finance.invoice", () => {
    const defs = getDefaultDefinitions("finance.invoice");
    expect(defs.length).toBeGreaterThan(0);
    expect(defs.some((d) => d.name === "cf_invoice_source")).toBe(true);
  });

  it("returns definitions for purchasing.supplier", () => {
    const defs = getDefaultDefinitions("purchasing.supplier");
    expect(defs.length).toBeGreaterThan(0);
    expect(defs.some((d) => d.name === "cf_supplier_category")).toBe(true);
  });

  it("returns empty array for unsupported entity type", () => {
    const defs = getDefaultDefinitions("unknown.entity");
    expect(defs.length).toBe(0);
  });

  it("gets definition by ID", () => {
    const def = getDefinitionById("finance.invoice", "cf_invoice_source");
    expect(def).toBeDefined();
    expect(def?.name).toBe("cf_invoice_source");
  });

  it("returns undefined for non-existent definition", () => {
    const def = getDefinitionById("finance.invoice", "non_existent");
    expect(def).toBeUndefined();
  });
});

