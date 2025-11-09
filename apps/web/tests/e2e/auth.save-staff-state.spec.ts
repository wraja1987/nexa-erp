import { test, expect } from "@playwright/test";

test("@staff-setup login and save storage state", async ({ page, context }) => {
  const base = process.env.PW_BASE_URL || process.env.BASE_URL || "https://app.nexaai.co.uk";
  const email = process.env.STAFF_EMAIL || "staff@nexa.ai";
  const password = process.env.STAFF_PASSWORD || "ChangeMe!123";

  // Programmatic login via NextAuth credentials
  const csrf = await page.request.get(base + "/api/auth/csrf");
  const data = await csrf.json();
  const csrfToken: string = data.csrfToken;
  const resp = await page.request.post(base + "/api/auth/callback/credentials", {
    form: { csrfToken, email, password, callbackUrl: base + "/dashboard" },
  });
  expect([200, 302]).toContain(resp.status());

  await page.goto(base + "/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  await context.storageState({ path: "tests/e2e/.auth/staff.json" });
});


