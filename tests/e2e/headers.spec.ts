import { test, expect } from '@playwright/test';

const BASE = process.env.PW_BASE_URL || 'http://localhost:3000';

async function expectSecurityHeaders(page: any, path: string) {
  const res = await page.request.get(BASE + path);
  expect(res.status()).toBeLessThan(400);
  const hsts = res.headers()['strict-transport-security'] || '';
  const rp = res.headers()['referrer-policy'];
  const xcto = res.headers()['x-content-type-options'];
  const pp = res.headers()['permissions-policy'] || '';
  expect(rp).toBe('strict-origin-when-cross-origin');
  expect(xcto).toBe('nosniff');
  expect(pp).toContain('geolocation=()');
  // HSTS present in https environments; in local http it may be absent; do a soft check
  if (BASE.startsWith('https://')) {
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  }
}

test.describe('Security headers', () => {
  test('login and dashboard set core security headers', async ({ page }) => {
    await expectSecurityHeaders(page, '/login');
    // Attempt dashboard; may redirect to login if unauthenticated
    const res = await page.request.get(BASE + '/dashboard');
    expect(res.status()).toBeGreaterThan(199);
    const rp = res.headers()['referrer-policy'];
    const xcto = res.headers()['x-content-type-options'];
    expect(rp).toBe('strict-origin-when-cross-origin');
    expect(xcto).toBe('nosniff');
  });
});


