import { test, expect } from "@playwright/test";

test.describe("KPI endpoints", () => {
  const paths = ["/api/kpi/revenue","/api/kpi/gm","/api/kpi/invoices","/api/kpi/wip"];
  for (const p of paths) {
    test(`GET ${p} returns 200 and ETag`, async ({ request }) => {
      const r1 = await request.get(p);
      expect(r1.status()).toBe(200);
      const etag = r1.headers()["etag"];
      expect(etag).toBeTruthy();
      const r2 = await request.get(p, { headers: { "If-None-Match": etag! } });
      expect([200,304]).toContain(r2.status());
    });
  }
});

test("modules has 200 and optional 304", async ({ request }) => {
  const r1 = await request.get("/api/modules?tree=1");
  expect([200,204]).toContain(r1.status());
  const etag = r1.headers()["etag"];
  if (etag) {
    const r2 = await request.get("/api/modules?tree=1", { headers: { "If-None-Match": etag } });
    expect([200,304]).toContain(r2.status());
  }
});
