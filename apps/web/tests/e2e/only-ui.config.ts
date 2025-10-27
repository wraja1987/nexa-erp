import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "apps/web/tests/e2e",
  testMatch: "ui.spec.ts",
  use: { baseURL: "http://localhost:3000" },
});




