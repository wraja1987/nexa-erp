// @prod-verify
import { test, expect } from '@playwright/test';

test.describe('@prod-verify smoke', () => {
  test('home responds', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Nexa|ERP|Login/i);
  });

  test('readyz returns 200/204/401/403', async ({ request }) => {
    const res = await request.get('/api/readyz');
    expect([200, 204, 401, 403]).toContain(res.status());
  });
});
