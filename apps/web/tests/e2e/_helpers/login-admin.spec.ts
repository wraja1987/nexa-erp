import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

test.use({ storageState: undefined });

test("login as ADMIN and save storage state", async ({ page, context }) => {
  // Load prod env file if present
  const envPath = path.resolve("tests/.env.playwright.prod");
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

  const baseUrl = process.env.PW_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const email = process.env.ADMIN_EMAIL || "";
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) test.fail(true, "ADMIN_EMAIL/ADMIN_PASSWORD not provided");

  const bypass = process.env.VERCEL_BYPASS_TOKEN;
  if (bypass && baseUrl.startsWith("https://")) {
    // Set Vercel deployment protection bypass cookie
    await page.goto(`${baseUrl}/?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=${bypass}`);
  }

  await page.goto(`${baseUrl}/login`);
  // Ensure NextAuth csrfToken is populated by client script
  const csrf = page.locator('input[name="csrfToken"]');
  await expect(async () => {
    const v = await csrf.inputValue();
    expect(v && v.length > 0).toBeTruthy();
  }).toPass({ intervals: [300, 500, 800], timeout: 10000 });
  const emailInput = page.locator('input[name="email"], input#email, input[type="email"]');
  const passInput = page.locator('input[name="password"], input#password, input[type="password"]');
  await emailInput.first().fill(email);
  await passInput.first().fill(password);
  const submitBtn = page.locator('button[type="submit"], input[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Continue")').first();
  await Promise.all([
    page.waitForURL(/\/dashboard/),
    submitBtn.click(),
  ]);

  const outDir = path.join(process.cwd(), "tests/e2e/.auth");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "admin.json");
  await context.storageState({ path: outPath });
  await expect(page).toHaveURL(/\/dashboard/);
  // Also save to .auth/admin.json for prod checks
  const rootAuthDir = path.join(process.cwd(), ".auth");
  fs.mkdirSync(rootAuthDir, { recursive: true });
  await context.storageState({ path: path.join(rootAuthDir, "admin.json") });
  // Also save to tests/.auth/admin.json (as some scripts require this path)
  const testsAuthDir = path.join(process.cwd(), "tests/.auth");
  fs.mkdirSync(testsAuthDir, { recursive: true });
  await context.storageState({ path: path.join(testsAuthDir, "admin.json") });
});


