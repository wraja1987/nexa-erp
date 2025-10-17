import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./apps/web/tests",
  use: { headless: true },
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
  timeout: 30000,
});


