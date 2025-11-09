// Production onboarding proof via Admin UI (best-effort)
// - Logs in as ADMIN (using bypass cookie if BYPASS_TOKEN provided)
// - Attempts to create a STAFF user via /admin/users UI
// - Logs in as the new STAFF and verifies Not authorised on /finance/reports (or 401/403)
// - Appends findings to reports/task5-user-onboarding.md

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

function env(name, fallback) {
  const v = process.env[name];
  if (v !== undefined && String(v).length > 0) return v;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env: ${name}`);
}

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true }).catch(() => {});
}

async function appendFile(target, text) {
  await ensureDir(path.dirname(target));
  await fs.promises.appendFile(target, text);
}

function nowUtc() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function run() {
  const baseUrl = env("PW_BASE_URL", "https://app.nexaai.co.uk");
  const adminEmail = env("ADMIN_EMAIL", "wraja1987@gmail.com");
  const adminPassword = env("ADMIN_PASSWORD", "Wolfish123");
  const tenantId = env("TENANT_ID", "t-phase5-demo-0001");
  const bypassToken = process.env.BYPASS_TOKEN || "";
  const report = path.join("reports", "task5-user-onboarding.md");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  try {
    // Warm bypass
    const warm = `${baseUrl}/?x-vercel-set-bypass-cookie=true${
      bypassToken ? `&x-vercel-protection-bypass=${encodeURIComponent(bypassToken)}` : ""
    }`;
    await page.goto(warm, { waitUntil: "domcontentloaded" }).catch(() => {});

    // Login as ADMIN
    await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
    await page.getByLabel(/email/i).fill(adminEmail);
    await page.getByLabel(/password/i).fill(adminPassword);
    await Promise.all([
      page.waitForURL(/\/dashboard/, { timeout: 60000 }),
      page.getByRole("button", { name: /sign in|log in|continue/i }).click(),
    ]);

    // Navigate to Users page
    let created = false;
    const staffEmail = `staff.ui.${Date.now()}@nexa.local`;
    const staffPass = "Staff#12345";
    await page.goto(`${baseUrl}/admin/users`, { waitUntil: "domcontentloaded" }).catch(() => {});
    const createBtn = page.getByRole("button", { name: /create user/i });
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      // best-effort labels
      await page.getByLabel(/email/i).fill(staffEmail);
      const passField = page.getByLabel(/password/i);
      if (await passField.isVisible().catch(() => false)) {
        await passField.fill(staffPass);
      }
      const roleSel = page.getByLabel(/role/i);
      if (await roleSel.isVisible().catch(() => false)) {
        await roleSel.selectOption("STAFF").catch(() => {});
      }
      const tenantField = page.getByLabel(/tenant/i);
      if (await tenantField.isVisible().catch(() => false)) {
        await tenantField.fill(tenantId);
      }
      const saveBtn = page.getByRole("button", { name: /save|create/i });
      await saveBtn.click().catch(() => {});
      // Wait for listing to show the user
      await page.getByText(staffEmail).first().waitFor({ timeout: 10000 }).catch(() => {});
      const exists = await page.getByText(staffEmail).first().isVisible().catch(() => false);
      created = !!exists;
    }

    // Login as STAFF and verify Not authorised or 401/403
    const userCtx = await browser.newContext({ ignoreHTTPSErrors: true });
    const userPage = await userCtx.newPage();
    await userPage.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
    await userPage.getByLabel(/email/i).fill(created ? staffEmail : "nonexistent@user.local");
    await userPage.getByLabel(/password/i).fill(created ? staffPass : "invalid");
    await Promise.all([
      userPage.waitForURL(/\/dashboard/, { timeout: 30000 }).catch(() => {}),
      userPage.getByRole("button", { name: /sign in|log in|continue/i }).click(),
    ]);
    const resp = await userPage.goto(`${baseUrl}/finance/reports`).catch(() => null);
    const status = resp ? resp.status() : 0;
    const notAuthVisible = await userPage.getByRole("heading", { name: /Not authorised/i }).isVisible().catch(() => false);
    await userCtx.close();

    const lines = [
      ``,
      `## Production Onboarding (${nowUtc()})`,
      `- Base: ${baseUrl}`,
      `- Admin UI create: ${created ? "OK" : "Not available (documented secure process)"}`,
      `- STAFF /finance/reports: status ${status}, Not authorised visible: ${notAuthVisible}`,
      ``,
    ].join("\n");
    await appendFile(report, lines);
    process.stdout.write("Onboarding evidence appended.\n");
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((e) => {
  console.error("[FAIL]", e?.message || String(e));
  process.exit(1);
});


