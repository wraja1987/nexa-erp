import { chromium } from "@playwright/test";
import fs from "node:fs";

(async () => {
  const baseURL = process.env.PW_BASE_URL || "http://localhost:3000";
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Opening login window… Use your creds to sign in, reach /dashboard, then wait.");
  await page.goto(`${baseURL}/login`);

  // Give you 90 seconds to complete login manually (MFA/captcha supported).
  await page.waitForTimeout(90000);

  // Save storage no matter what; you should ensure you reached /dashboard before timeout
  fs.mkdirSync("tests/e2e/.auth", { recursive: true });
  await context.storageState({ path: "tests/e2e/.auth/state.json" });
  console.log("Saved storageState to tests/e2e/.auth/state.json");

  await browser.close();
})();




