import base, { expect } from '@playwright/test';

export const test = base.extend({});

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { name: 'E2E' }, expires: new Date(Date.now()+3600_000).toISOString() }) });
  });
});

export { expect };



