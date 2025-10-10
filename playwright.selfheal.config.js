/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './selfheal',
  testMatch: ['prod-verify.spec.js'],
  // Ensure *only* our Playwright self-heal verifier runs
  testIgnore: [
    'apps/**',
    'packages/**',
    'scripts/**',
    '**/*.test.ts',
    '**/*.test.js',
    '**/__tests__/**'
  ],
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
};
export default config;
