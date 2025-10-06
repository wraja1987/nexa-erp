import { test, expect } from "@playwright/test";
const BASE="https://app.nexaai.co.uk";
test("Login → Dashboard KPI", async ({ page }) => {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill("input[name=email]", process.env.NEXA_DEMO_EMAIL || "info@chiefaa.com");
  await page.fill("input[name=password]", process.env.NEXA_DEMO_PASSWORD || "Wolfish123");
  await page.getByRole("button", { name: /sign in|log in|continue/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  const kpi = page.locator("[data-kpi], [data-testid=kpi-card]");
  await expect(kpi.first()).toBeVisible({ timeout: 15000 });
});

