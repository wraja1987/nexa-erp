import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PORTAL_URL || 'https://nexaai.co.uk';

export default defineConfig({
  testDir: './specs',
  retries: 2,
  timeout: 60_000,
  use: {
    baseURL,
    headless: true,
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

