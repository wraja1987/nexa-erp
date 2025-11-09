import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['**/*.spec.ts'],
  testIgnore: ['**/_disabled/**'],
  fullyParallel: false,
  timeout: 90_000,
  expect: { timeout: 8000 },
  use: {
    baseURL: process.env.PW_BASE_URL || 'http://localhost:3000',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: { 'x-e2e': '1' },
    storageState: fs.existsSync('tests/e2e/.auth/staff.json') ? 'tests/e2e/.auth/staff.json' : undefined,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: [['list']],
});
