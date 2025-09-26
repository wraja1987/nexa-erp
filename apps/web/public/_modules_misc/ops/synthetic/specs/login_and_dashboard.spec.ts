import { test, expect } from '@playwright/test';

test('portal dashboard is reachable and shows KPI', async ({ page }) => {
  const base = process.env.PORTAL_URL || 'https://nexaai.co.uk';
  await page.goto(base, { waitUntil: 'domcontentloaded' });

  const demoUser = process.env.DEMO_USER;
  const demoPass = process.env.DEMO_PASS;

  // Try to login if creds exist; otherwise skip gracefully
  if (demoUser && demoPass) {
    try {
      await page.goto(base + '/login');
      await page.fill('input[type="email"]', demoUser);
      await page.fill('input[type="password"]', demoPass);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {}
  }

  await page.goto(base + '/app/dashboard', { waitUntil: 'networkidle' });

  const kpiCard = page.locator('[data-test="kpi-card"]').first();
  const kpiLabel = page.getByText(/Revenue|Orders|Invoices|Gross Profit/i).first();
  if (await kpiCard.count()) {
    await expect(kpiCard).toBeVisible({ timeout: 15000 });
  } else {
    await expect(kpiLabel).toBeVisible({ timeout: 15000 });
  }
});

