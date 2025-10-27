import { test, expect, request } from '@playwright/test';

const BASE = 'https://app.nexaai.co.uk';
const ts = () => `ts=${Date.now()}`;

test('login page contains Nexa logo PNG', async ({ page }) => {
  await page.goto(`${BASE}/login?${ts()}`, { waitUntil: 'networkidle' });
  const img = page.locator('img[src="/logo-nexa.png"]');
  await expect(img).toHaveCount(1);
});

test('forgot-password page is public and returns 200', async ({ page }) => {
  const res = await page.goto(`${BASE}/forgot-password?${ts()}`, { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(200);
  const email = page.locator('input[type="email"], input[name="email"]');
  await expect(email.first()).toBeVisible();
});

test('forgot-password API returns 200 JSON', async () => {
  const ctx = await request.newContext();
  const resp = await ctx.post(`${BASE}/api/auth/forgot-password?${ts()}`, {
    headers: { 'content-type': 'application/json' },
    data: { email: 'wraja1987@gmail.com' }
  });
  expect(resp.status()).toBe(200);
  const body = await resp.json();
  expect(body).toBeTruthy();
});


