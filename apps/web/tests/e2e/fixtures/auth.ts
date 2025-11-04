import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    const email = process.env.NEXA_E2E_EMAIL;
    const password = process.env.NEXA_E2E_PASSWORD;
    if (email && password) {
      await page.goto("/login");
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      const passwordInput = page.locator('input[name="password"], input[type="password"]');
      const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")');
      await emailInput.first().fill(email);
      await passwordInput.first().fill(password);
      await submitBtn.first().click();
      // Assert we actually logged in; throw if not
      await expect(page).toHaveURL(/\/dashboard/i, { timeout: 20000 });
      // Optional: sanity check a known dashboard marker
      // await expect(page.getByRole("navigation", { name: /primary/i })).toBeVisible();
    }
    await use(page);
  },
});
export { expect };


