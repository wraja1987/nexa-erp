import { test as base, BrowserContext } from '@playwright/test';

async function mockAuth(context: BrowserContext) {
  await context.route('**/api/auth/session**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'cache-control': 'no-store' },
      body: JSON.stringify({
        user: { name: 'E2E User', email: 'e2e@nexa.local' },
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    });
  });
}

export const test = base.extend({
  context: async ({ context }, use) => {
    await mockAuth(context);
    await use(context);
  },
});

export { mockAuth };


