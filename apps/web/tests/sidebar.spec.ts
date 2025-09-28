import { test, expect, request } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test('redirects unauthenticated /dashboard to /login and hides sidebar on /login', async ({ page }) => {
  await page.goto(`${BASE}/dashboard`);
  await page.waitForURL(/\/login(\?|$)/);
  expect(page.url()).toContain('/login');
  await expect(page.locator('aside')).toHaveCount(0);
});

// Note: programmatic login depends on project auth; keep light
test('modules API returns groups for authenticated later (smoke unauth allowed)', async ({ }) => {
  const ctx = await request.newContext();
  const r = await ctx.get(`${BASE}/api/modules?tree=1`);
  expect(r.ok()).toBeTruthy();
});
