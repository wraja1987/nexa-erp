import { describe, it, expect } from "vitest";
import * as vat from "@/server/tax/vat";
import * as mtd from "@/server/tax/hmrc-mtd";
import * as gcc from "@/server/tax/gcc-einvoice";
import * as audit from "@/server/tax/audit-pack";

describe("Tax/Compliance scaffolding", () => {
  it("vat exports exist", () => {
    expect(typeof vat.buildVatSummary).toBe("function");
    expect(typeof vat.listVatReturns).toBe("function");
    expect(typeof vat.createDraftVatReturn).toBe("function");
  });
  it("hmrc mtd exports exist", () => {
    expect(typeof mtd.buildMtdPayload).toBe("function");
    expect(typeof mtd.recordMtdSubmissionResult).toBe("function");
  });
  it("gcc einvoice export exists", () => {
    expect(typeof gcc.buildGccEinvoicePayload).toBe("function");
  });
  it("audit pack export exists and returns structured object", async () => {
    const pack = await audit.buildAuditPack({ tenantId: "t1" } as any, {});
    expect(pack).toHaveProperty("sections");
  });
});


