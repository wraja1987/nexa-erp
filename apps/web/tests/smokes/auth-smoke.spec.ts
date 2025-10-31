import { test, expect } from '@playwright/test';

const EMAIL = process.env.E2E_CREDENTIALS_EMAIL;
const PASSWORD = process.env.E2E_CREDENTIALS_PASSWORD;

test('credentials -> /dashboard', async ({ page }) => {
  test.skip(!EMAIL || !PASSWORD, 'E2E creds not set');
  await page.goto('/login');
  await page.fill('input[name="email"], #email', EMAIL!);
  await page.fill('input[name="password"], #password', PASSWORD!);
  await Promise.all([
    page.waitForURL(/\/dashboard/),
    page.click('button[type="submit"], button[data-testid="login-submit"]'),
  ]);
  await expect(page).toHaveURL(/\/dashboard/);
});
