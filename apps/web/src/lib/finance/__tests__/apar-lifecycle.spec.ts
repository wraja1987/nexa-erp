import { describe, it, expect } from "vitest";
import { canTransitionInvoice, canTransitionBill, nextStatusForInvoiceAfterPayment, nextStatusForBillAfterPayment } from "../apar-lifecycle";

describe("AP/AR lifecycle", () => {
  it("allows invoice draft -> approved", () => {
    expect(canTransitionInvoice("draft", "approved")).toBe(true);
  });
  it("blocks invoice paid -> draft", () => {
    expect(canTransitionInvoice("paid", "draft" as any)).toBe(false);
  });
  it("invoice next status after payment", () => {
    expect(nextStatusForInvoiceAfterPayment("approved", 0)).toBe("paid");
    expect(nextStatusForInvoiceAfterPayment("approved", 100)).toBe("part_paid");
  });
  it("allows bill draft -> approved", () => {
    expect(canTransitionBill("draft", "approved")).toBe(true);
  });
  it("bill next status after payment", () => {
    expect(nextStatusForBillAfterPayment("approved", 0)).toBe("paid");
    expect(nextStatusForBillAfterPayment("approved", 1)).toBe("part_paid");
  });
});


