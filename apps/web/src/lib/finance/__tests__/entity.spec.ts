import { describe, it, expect } from "vitest";
import { resolveLegalEntityScope, LegalEntityRecord } from "../entity";

describe("resolveLegalEntityScope", () => {
  const tenantId = "t1";
  const entities: LegalEntityRecord[] = [
    { id: "e1", tenantId, name: "Co A", currencyCode: "GBP" },
    { id: "e2", tenantId, name: "Co B", currencyCode: "GBP" },
  ];

  it("returns tenant-wide when no entities", () => {
    const r = resolveLegalEntityScope(tenantId, null, []);
    expect(r).toEqual({ entityId: null, mode: "tenant-wide" });
  });

  it("returns single-tenant when exactly one entity", () => {
    const r = resolveLegalEntityScope(tenantId, null, [entities[0]]);
    expect(r).toEqual({ entityId: "e1", mode: "single-tenant" });
  });

  it("validates requested entity for multi-entity", () => {
    const r = resolveLegalEntityScope(tenantId, "e2", entities);
    expect(r).toEqual({ entityId: "e2", mode: "multi-entity-validated" });
  });

  it("throws when entity does not belong to tenant", () => {
    expect(() =>
      resolveLegalEntityScope(tenantId, "bad", entities)
    ).toThrowError();
  });
});


