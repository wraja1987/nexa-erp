import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: false,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.PW_BASE_URL || 'http://localhost:3000',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: { 'x-e2e': '1' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
});
