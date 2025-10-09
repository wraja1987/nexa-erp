const { test, expect, request } = require("@playwright/test");

const mustHaveHeaders = [
  ["strict-transport-security", v => /max-age=\d+/.test(v || "")],
  ["x-content-type-options", v => (v||"").toLowerCase().includes("nosniff")],
  ["x-frame-options", v => (v||"").toLowerCase().includes("deny") || (v||"").toLowerCase().includes("sameorigin")],
  ["referrer-policy", v => !!v],
];

test.describe("@prod-verify", () => {
  test("health/status endpoint responds", async ({ request }) => {
    const base = process.env.BASE_URL || process.env.PROD_URL;
    test.skip(!base, "BASE_URL/PROD_URL not set");
    const ctx = await request.newContext();
    const paths = ["/health", "/status"];
    let ok = false;
    for (const p of paths) {
      const r = await ctx.get(new URL(p, base).toString());
      if (r.status() < 500) { ok = true; break; }
    }
    expect(ok, "No healthy /health or /status endpoint").toBeTruthy();
  });

  test("login page loads (200/3xx) and has title", async ({ page }) => {
    const base = process.env.BASE_URL || process.env.PROD_URL;
    test.skip(!base, "BASE_URL/PROD_URL not set");
    const url = new URL("/login", base).toString();
    const resp = await page.goto(url, { waitUntil: "domcontentloaded" });
    expect(resp.status(), "login non-200/3xx").toBeLessThan(400);
    const title = await page.title();
    expect(title.length, "empty title").toBeGreaterThan(0);
  });

  test("security headers present on / (best-effort)", async ({ request }) => {
    const base = process.env.BASE_URL || process.env.PROD_URL;
    test.skip(!base, "BASE_URL/PROD_URL not set");
    const ctx = await request.newContext();
    const r = await ctx.get(base);
    const headers = r.headers();
    const missing = [];
    for (const [h, rule] of mustHaveHeaders) {
      const v = headers[h];
      if (!rule(v)) missing.push(h);
    }
    expect(missing, "Missing headers").toEqual([]);
  });
});
