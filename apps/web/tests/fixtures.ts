import base, { expect } from '@playwright/test';

// Shared fixtures: mock auth session and provide a basic KPI dashboard mock by default
export const test = base.extend({});

test.beforeEach(async ({ page }) => {
  // Auth session always present
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { name: 'E2E' }, expires: new Date(Date.now()+3600_000).toISOString() })
    });
  });
  // Default KPI dashboard (tests can override per-spec)
  await page.route('**/api/kpi/dashboard', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ totalRevenue: 123000, arBalance: 1000, apBalance: 500, ordersToday: 3 })
    });
  });
});

export { expect };






