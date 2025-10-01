import { test, expect } from '@playwright/test';
import { injectAxe } from '@axe-core/playwright';

async function runA11y(page: import('@playwright/test').Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await injectAxe(page);

  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      resultTypes: ['violations'],
    });
  });

  const violations = (results as any).violations ?? [];
  const critical = violations.filter((v: any) => v.impact === 'critical');
  const serious = violations.filter((v: any) => v.impact === 'serious');

  await test.info().attach('axe-results.json', {
    body: Buffer.from(JSON.stringify(violations, null, 2)),
    contentType: 'application/json',
  });

  const summary =
    `Axe a11y summary for ${url}\n` +
    `  total violations: ${violations.length}\n` +
    `  serious: ${serious.length}, critical: ${critical.length}\n` +
    `  rules: ${violations.map((v: any) => v.id).join(', ') || '(none)'}\n`;
  console.log(summary);

  if (process.env.A11Y_ENFORCE === '1') {
    await expect(critical.length, `Critical a11y violations on ${url}`).toBe(0);
  }
}

test.describe('Accessibility smoke checks', () => {
  test('login page smoke', async ({ page }) => {
    await runA11y(page, '/login');
  });

  test('dashboard page smoke', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__E2E_PRELOAD__ = {
        top: ['Sales','Inventory'],
        kpi: { totalRevenue: 100, arBalance: 50, apBalance: 25, ordersToday: 5 }
      };
    });
    await runA11y(page, '/e2e/dashboard');
  });
});
