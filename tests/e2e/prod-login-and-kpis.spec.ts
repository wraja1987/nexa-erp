import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://app.nexaai.co.uk';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const SUPER_EMAIL = process.env.SUPER_ADMIN_EMAIL!;
const SUPER_PASSWORD = process.env.SUPER_ADMIN_PASSWORD!;

async function uiChromeReady(page: Page) {
  const selectors = [
    'nav', '[role="navigation"]', '[data-testid="topbar"]',
    '[data-testid="user-avatar"]', 'img[alt*="avatar" i]',
    'button:has-text("Logout")', 'button:has-text("Sign out")',
    '[data-testid="user-menu"]', '[data-testid="profile-menu"]'
  ];
  for (const s of selectors) {
    const el = page.locator(s).first();
    if (await el.count()) {
      try { if (await el.isVisible()) return true; } catch {}
    }
  }
  return false;
}

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

  // Best-effort cookie banner dismiss
  for (const sel of ['button:has-text("Accept")','button:has-text("Allow all")',
                     '[data-testid="cookie-accept"]','[data-test="cookie-accept"]']) {
    const el = page.locator(sel).first();
    if (await el.count()) { try { if (await el.isVisible()) await el.click(); } catch {} }
  }

  // Robust inputs
  await page.locator('input[placeholder*="mail" i], input[type="email"], input[name*="email" i], #email').fill(email);
  await page.locator('input[placeholder*="password" i], input[type="password"], input[name*="password" i], #password').fill(password);

  await Promise.all([
    page.waitForURL(/\/dashboard/i, { timeout: 30000 }),
    page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first().click(),
  ]);

  // Assert dashboard route + chrome
  await expect(page).toHaveURL(/\/dashboard/i);
  const chromeOk = await uiChromeReady(page);
  expect(chromeOk, 'Expected nav/avatar/logout to be visible on dashboard').toBeTruthy();
}

test.describe('Nexa (prod) smokes', () => {
  test('Admin: login + key lists populated', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Verify list pages where we know rows exist from seeding
    for (const path of [
      '/finance/invoices',
      '/inventory/stock-moves',
      '/manufacturing/orders',
      '/pos/receipts',
      '/projects/timesheets'
    ]) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
      // Generic row locator variants
      const row = page.locator(
        '[data-testid="list-row"], [role="row"] >> nth=1, tr >> nth=1, li >> nth=1, .row, .table-row'
      ).first();
      await expect(row).toBeVisible();
    }
  });

  test('Super admin: login + dashboard chrome', async ({ page }) => {
    await login(page, SUPER_EMAIL, SUPER_PASSWORD);
  });
});
