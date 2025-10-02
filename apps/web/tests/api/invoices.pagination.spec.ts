import { test, expect } from "@playwright/test";

test.describe("Invoices pagination", () => {
  test("supports limit/offset and nextOffset", async ({ request }) => {
    const limit = 2;
    const r1 = await request.get(`/api/kpi/invoices?limit=${limit}&offset=0`);
    expect(r1.status()).toBe(200);
    const b1 = await r1.json();
    expect(b1.ok).toBeTruthy();
    expect(Array.isArray(b1.list)).toBeTruthy();
    expect(b1.limit).toBe(limit);
    // nextOffset if at least limit rows
    if (b1.list.length === limit) {
      expect(b1.nextOffset).toBe(limit);
      const r2 = await request.get(`/api/kpi/invoices?limit=${limit}&offset=${b1.nextOffset}`);
      expect([200,204]).toContain(r2.status());
      const b2 = await r2.json();
      if (b2.ok) {
        expect(b2.offset).toBe(b1.nextOffset);
      }
    }
  });
});






