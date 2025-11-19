import { describe, it, expect } from "vitest";
import { getWorkflowDefinition, listSupportedEntityTypes } from "../registry";

describe("Workflow Registry", () => {
  it("returns workflow definition for finance.invoice", () => {
    const result = getWorkflowDefinition("finance.invoice", "test-tenant");
    expect(result.supported).toBe(true);
    expect(result.def).toBeDefined();
    expect(result.def?.entityType).toBe("finance.invoice");
    expect(result.def?.states.length).toBeGreaterThan(0);
    expect(result.def?.transitions.length).toBeGreaterThan(0);
  });

  it("returns workflow definition for purchasing.po", () => {
    const result = getWorkflowDefinition("purchasing.po", "test-tenant");
    expect(result.supported).toBe(true);
    expect(result.def).toBeDefined();
    expect(result.def?.entityType).toBe("purchasing.po");
  });

  it("returns workflow definition for manufacturing.workorder", () => {
    const result = getWorkflowDefinition("manufacturing.workorder", "test-tenant");
    expect(result.supported).toBe(true);
    expect(result.def).toBeDefined();
    expect(result.def?.entityType).toBe("manufacturing.workorder");
  });

  it("returns unsupported for unknown entity type", () => {
    const result = getWorkflowDefinition("unknown.entity", "test-tenant");
    expect(result.supported).toBe(false);
    expect(result.reason).toContain("No workflow definition found");
  });

  it("lists all supported entity types", () => {
    const types = listSupportedEntityTypes();
    expect(types.length).toBeGreaterThan(0);
    expect(types).toContain("finance.invoice");
    expect(types).toContain("purchasing.po");
    expect(types).toContain("manufacturing.workorder");
  });
});

