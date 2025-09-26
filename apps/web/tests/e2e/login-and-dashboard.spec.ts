import { test, expect } from '@playwright/test';

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@example.com';
const DEMO_PASS = process.env.DEMO_PASS || 'demo-password';

test('login and dashboard render', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  await page.goto(base + '/login');
  await expect(page.locator('h1:text-is("Sign in")')).toBeVisible();

  await page.getByLabel('Email').fill(DEMO_EMAIL);
  await page.getByLabel('Password').fill(DEMO_PASS);
  await Promise.all([
    page.waitForURL(base + '/dashboard'),
    page.getByRole('button', { name: 'Log in' }).click(),
  ]);

  await expect(page.locator('text=Dashboard')).toBeVisible();
  await expect(page.locator('text=Quick Links')).toBeVisible();

  // Click one sidebar link and verify header exists
  const firstModule = page.locator('a[href^="/modules/"]').first();
  const href = await firstModule.getAttribute('href');
  await firstModule.click();
  if (href) {
    await expect(page).toHaveURL(base + href);
  }
  await expect(page.locator('h1')).toBeVisible();
});
