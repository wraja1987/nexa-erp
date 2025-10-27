import { test, expect } from '@playwright/test';
const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('public login shows Nexa PNG + gradient', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await expect(page.locator('img[alt="Nexa"]')).toBeVisible();
  await expect(page.getByTestId('public-gradient')).toBeVisible();
});

test('protected shell has sidebar + topbar + AI bar (or redirects to login)', async ({ page }) => {
  const resp = await page.goto(`${BASE}/dashboard`);
  // If unauthenticated, middleware redirects to /login (302/307) and we assert public page instead
  if (page.url().includes('/login')) {
    await expect(page.getByTestId('public-gradient')).toBeVisible();
    await expect(page.locator('img[alt="Nexa"]')).toBeVisible();
    return;
  }
  // If already authed, the shell should be present
  await expect(page.getByTestId('layout-sidebar')).toBeVisible();
  await expect(page.getByTestId('layout-topbar')).toBeVisible();
  await expect(page.getByTestId('ai-engine-bar')).toBeVisible();
});
