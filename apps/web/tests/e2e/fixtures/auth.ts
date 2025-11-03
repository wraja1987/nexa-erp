import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    const email = process.env.NEXA_E2E_EMAIL;
    const password = process.env.NEXA_E2E_PASSWORD;
    if (email && password) {
      await page.goto("/login");
      await page.getByLabel(/email/i).fill(email);
      await page.getByLabel(/password/i).fill(password);
      await page.getByRole("button", { name: /sign in|log in/i }).click();
      await page.waitForURL(/\/dashboard/i, { timeout: 15000 }).catch(() => {});
    }
    await use(page);
  },
});

export const expect = test.expect;


