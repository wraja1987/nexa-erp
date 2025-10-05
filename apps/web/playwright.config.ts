import { defineConfig } from "@playwright/test";
export default defineConfig({ retries: 2, timeout: 20000, reporter: [["list"]] });
