import { test, expect } from "@playwright/test";

const base = "https://app.nexaai.co.uk";

test("public auth pages stay public", async ({ page }) => {
  await page.goto(`${base}/login`);
  await expect(page.getByText("Sign in to Nexa ERP")).toBeVisible();
  await page.goto(`${base}/forgot-password`);
  await expect(page.getByText("Forgot password")).toBeVisible();
});

test("tenant-scoped API is not anonymous", async ({ request }) => {
  const r = await request.get(`${base}/api/kpi/dashboard`);
  expect([401, 403]).toContain(r.status());
});






