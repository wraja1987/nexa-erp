import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'NEXT_DISABLE_ESLINT=1 NEXT_DISABLE_TYPECHECK=1 npx next build && npx next start -p 3000',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
  },
});
