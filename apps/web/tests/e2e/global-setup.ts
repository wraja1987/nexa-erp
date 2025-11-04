import { chromium, expect } from "@playwright/test";

export default async function globalSetup() {
  const baseURL = process.env.PW_BASE_URL || "http://localhost:3000";
  const email = process.env.NEXA_E2E_EMAIL;
  const password = process.env.NEXA_E2E_PASSWORD;
  if (!email || !password) throw new Error("NEXA_E2E_EMAIL/NEXA_E2E_PASSWORD not set.");

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}/login`, { waitUntil: "load" });

  const emailInput = page.locator(
    'input[name="email"], input[type="email"], [autocomplete="username"], [placeholder*="email" i], [aria-label*="email" i]'
  ).first();
  const passInput = page.locator(
    'input[name="password"], input[type="password"], [autocomplete="current-password"], [placeholder*="password" i], [aria-label*="password" i]'
  ).first();
  const submitBtn = page.locator(
    'button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), [role="button"]:has-text("Sign in"), [role="button"]:has-text("Log in")'
  ).first();

  await emailInput.fill(email);
  await passInput.fill(password);
  await submitBtn.click();

  await expect(page).toHaveURL(/\/dashboard/i, { timeout: 8000 });

  await context.storageState({ path: "apps/web/tests/e2e/.auth/state.json" });
  await browser.close();
}
