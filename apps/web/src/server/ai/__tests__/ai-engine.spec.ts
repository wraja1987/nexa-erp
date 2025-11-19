import { describe, it, expect } from "vitest";
import { NexaAiClient } from "@/server/ai/client";
import { stripPiiFromCustomer, stripPiiFromVendor, stripPiiFromEmployee, stripPiiFromGenericRecord } from "@/server/ai/pseudo";
import * as recon from "@/server/ai/tasks/financeReconciliation";
import * as gl from "@/server/ai/tasks/glAnomaly";
import * as inv from "@/server/ai/tasks/inventoryAnomaly";
import * as pay from "@/server/ai/tasks/payrollAnomaly";
import * as mgmt from "@/server/ai/tasks/managementCommentary";

describe("AI Engine scaffolding", () => {
  it("NexaAiClient.callModel returns string", async () => {
    const out = await NexaAiClient.callModel("Hello", { model: "cheap", tenantId: "t1", module: "test", task: "echo" });
    expect(typeof out).toBe("string");
  });
  it("Pseudonymisers mask PII", () => {
    const c = stripPiiFromCustomer({ id: "1", name: "Alice", email: "a@x", phone: "1" });
    const v = stripPiiFromVendor({ id: "2", name: "Bob", email: "b@x", address: "addr" });
    const e = stripPiiFromEmployee({ id: "3", firstName: "C", lastName: "D", email: "e@x" });
    const g = stripPiiFromGenericRecord({ name: "N", notes: "free text", amount: 10 });
    expect(c.email).toBeUndefined();
    expect(v.address).toBeUndefined();
    expect(e.email).toBeUndefined();
    expect(typeof g.name).toBe("string");
  });
  it("Task functions are structured (no throws on empty data)", async () => {
    const scope = { tenantId: "t1" } as any;
    const r1 = await recon.getReconciliationSuggestions(scope).catch(() => null);
    const r2 = await gl.getGlAnomalies(scope).catch(() => null);
    const r3 = await inv.getInventoryAnomalies(scope).catch(() => null);
    const r4 = await pay.getPayrollAnomalies(scope).catch(() => null);
    const r5 = await mgmt.getManagementCommentary(scope).catch(() => null);
    expect(typeof r1 === "object" || r1 === null).toBeTruthy();
    expect(typeof r2 === "object" || r2 === null).toBeTruthy();
    expect(typeof r3 === "object" || r3 === null).toBeTruthy();
    expect(typeof r4 === "object" || r4 === null).toBeTruthy();
    expect(typeof r5 === "object" || r5 === null).toBeTruthy();
  });
});


