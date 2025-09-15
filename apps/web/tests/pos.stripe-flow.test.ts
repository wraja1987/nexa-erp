import { describe, it, expect } from "vitest";

// Simulated Stripe Terminal flow wrappers
async function createPaymentIntent(amountPence: number, currency = "gbp") {
  return { id: `pi_test_${Date.now()}`, client_secret: "secret" };
}
async function capturePaymentIntent(id: string) {
  return { id, status: "succeeded" };
}
async function refundPaymentIntent(id: string, amountPence: number) {
  return { id: `re_${Date.now()}`, status: "succeeded" };
}
async function reconcile() {
  return { reconciled: true, pending: 0 };
}

describe("Stripe Terminal flow (simulated)", () => {
  it("creates → captures → refunds → reconciles", async () => {
    const pi = await createPaymentIntent(1234, "gbp");
    expect(pi.id).toMatch(/^pi_/);
    const cap = await capturePaymentIntent(pi.id);
    expect(cap.status).toBe("succeeded");
    const ref = await refundPaymentIntent(pi.id, 1234);
    expect(ref.status).toBe("succeeded");
    const rec = await reconcile();
    expect(rec.reconciled).toBe(true);
  });
});










