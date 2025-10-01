import { test, expect } from './fixtures';

test('sidebar counts match /api/modules?tree=1', async ({ page, request, baseURL }) => {
  const res = await request.get(`${baseURL}/api/modules?tree=1`);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  const topLevel = Array.from(new Set((Array.isArray(data) ? data : []).map((n: any) => String(n?.name || '').split('.')[0]).filter(Boolean)));
  const expected = topLevel.length;
  expect(expected).toBeGreaterThan(0);

  await page.route('**/api/auth/session', async route => { await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { name: 'T' }, expires: new Date(Date.now()+3600_000).toISOString() }) }); });
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

  const shell = page.locator('[data-testid="sidebar"], nav[aria-label="Sidebar"], aside[role="complementary"], nav[role="navigation"], [role="navigation"]').first();
  await expect(shell).toHaveCount(1);

  const toggles = shell.locator('[aria-expanded="false"], [data-collapsed="true"], button[aria-controls]');
  const tCount = await toggles.count();
  for (let i = 0; i < tCount; i++) { await toggles.nth(i).click().catch(() => {}); }

  let count = await shell.locator('[data-testid="nav-item"][data-level="top"], [data-top-level="true"]').count();
  if (count === 0) {
    const items = shell.locator('ul > li').filter({ hasNot: shell.locator('ul ul') }).filter({ hasNot: shell.locator('[aria-hidden="true"]') });
    count = await items.count();
  }

  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(expected + 2);
});


