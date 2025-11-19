import { describe, it, expect } from "vitest";
import { canApprove, canCancel } from "@/lib/purchasing/po-lifecycle";

describe("PO lifecycle", () => {
  it("approve only from draft", () => {
    expect(canApprove("draft")).toBe(true);
    expect(canApprove("approved")).toBe(false);
    expect(canApprove("cancelled")).toBe(false);
  });
  it("cancel from draft or approved", () => {
    expect(canCancel("draft")).toBe(true);
    expect(canCancel("approved")).toBe(true);
    expect(canCancel("closed")).toBe(false);
  });
});


