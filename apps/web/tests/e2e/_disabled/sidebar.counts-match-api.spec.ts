import { test, expect } from '@playwright/test';

test('sidebar counts match /api/modules?tree=1', async ({ page }) => {
  const top = ['Sales','Inventory','Finance','HR'];
  await page.addInitScript((data) => { (window as any).__E2E_PRELOAD__ = { top: data }; }, top);
  await page.goto('/e2e/dashboard', { waitUntil: 'domcontentloaded' });

  const items = page.locator('[data-testid="nav-item"][data-level="top"]');
  await expect(items).toHaveCount(top.length);
});


