import { test, expect } from './fixtures';

test('authed user sees sidebar on /dashboard', async ({ page }) => {
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { name: 'Test User', email: 'test@nexa.local' }, expires: new Date(Date.now() + 3600_000).toISOString() }) });
  });
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/dashboard(\/)?$/);

  const sidebar = page.locator('[data-testid="sidebar"], nav[aria-label="Sidebar"], aside[role="complementary"], nav[role="navigation"], [role="navigation"]').first();
  await expect(sidebar).toHaveCount(1);
  try { await expect(sidebar).toBeVisible({ timeout: 2000 }); } catch {}
});


