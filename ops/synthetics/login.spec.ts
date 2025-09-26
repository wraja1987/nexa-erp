import { test, expect } from "@playwright/test";
const APP = process.env.APP_URL!;
const EMAIL = "wraja1987@yahoo.co.uk";
const PASS  = "Wolfish123";
test("Nexa login → dashboard", async ({ page }) => {
  await page.goto(`${APP}/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).fill(PASS);
  await page.getByRole("button", { name: /log in|sign in/i }).click();
  await page.waitForURL(new RegExp(`${APP}/(app|dashboard)`), { timeout: 25000 });
  await expect(page.locator("h1, h2").filter({ hasText: /dashboard|nexa/i }).first()).toBeVisible();
});
