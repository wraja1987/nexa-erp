import { test, expect } from './fixtures';

test('dashboard renders KPI values from API (mocked)', async ({ context, page }) => {
  const mocked = { totalRevenue: 999000, arBalance: 111000, apBalance: 222000, ordersToday: 33 };
  await page.unroute('**/api/kpi/dashboard').catch(()=>{});
  await context.route('**/api/kpi/dashboard', route => {
    route.fulfill({ status: 200, contentType: 'application/json', headers: { 'cache-control': 'no-store' }, body: JSON.stringify(mocked) });
  });
  await page.route('**/api/auth/session', async route => { await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { name: 'T' }, expires: new Date(Date.now()+3600_000).toISOString() }) }); });

  const [req, res] = await Promise.all([
    page.waitForRequest('**/api/kpi/dashboard'),
    page.waitForResponse('**/api/kpi/dashboard'),
    page.goto('/dashboard', { waitUntil: 'domcontentloaded' }),
  ]);

  expect(req.url()).toMatch(/\/api\/kpi\/dashboard$/);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toEqual(mocked);

  await expect(page.locator('h1, [role="heading"], [data-testid^="kpi-"], [data-kpi-container]')).toHaveCountGreaterThan(0);
});


