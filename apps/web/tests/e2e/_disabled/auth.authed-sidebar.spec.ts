import { test, expect } from '@playwright/test';

test('authed user sees sidebar on /dashboard', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__E2E_PRELOAD__ = { top: ['Sales','Inventory','Finance'] };
  });
  await page.goto('/e2e/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('sidebar')).toBeVisible();
});


