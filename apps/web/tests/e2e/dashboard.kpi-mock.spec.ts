import { test, expect } from '@playwright/test';
const mocked = { totalRevenue: 999000, arBalance: 111000, apBalance: 222000, ordersToday: 33 };
const numLike = (n: number) => new RegExp(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '[,\\s]?'));

test('dashboard renders KPI values from API (mocked)', async ({ page }) => {
  await page.addInitScript((data) => { (window as any).__E2E_PRELOAD__ = { kpi: data }; }, mocked);
  await page.goto('/e2e/dashboard', { waitUntil: 'domcontentloaded' });

  await expect(page.getByTestId('kpi-totalRevenue')).toContainText(numLike(mocked.totalRevenue));
  await expect(page.getByTestId('kpi-arBalance')).toContainText(numLike(mocked.arBalance));
  await expect(page.getByTestId('kpi-apBalance')).toContainText(numLike(mocked.apBalance));
  await expect(page.getByTestId('kpi-ordersToday')).toContainText(String(mocked.ordersToday));
});


