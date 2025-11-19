import { describe, it, expect, vi } from "vitest";
import { getFunctionalCurrencyForScope } from "../fx";
import * as entity from "../entity";

describe("finance fx helpers", () => {
  it("falls back to GBP when no entity scope", async () => {
    vi.spyOn(entity, "assertLegalEntityAccess").mockResolvedValue({ tenantId: "t1", entityId: null, mode: "tenant-wide" } as any);
    const r = await getFunctionalCurrencyForScope(null);
    expect(r.currency).toBe("GBP");
  });
});


