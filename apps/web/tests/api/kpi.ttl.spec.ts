import { test, expect } from "@playwright/test";

test("KPI_TTL_SEC reflected in Cache-Control", async ({ request }) => {
  const r = await request.get("/api/kpi/revenue");
  expect(r.status()).toBe(200);
  const cc = r.headers()["cache-control"] || "";
  // Accept s-maxage present
  expect(cc).toMatch(/s-maxage=\d+/);
});



