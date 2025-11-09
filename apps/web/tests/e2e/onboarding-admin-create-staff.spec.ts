import { test, expect, request as pwRequest } from "@playwright/test";

// Uses ADMIN storage state for UI navigation when available
test.use({ storageState: "tests/e2e/.auth/admin.json" });

const BASE = process.env.PW_BASE_URL || "http://localhost:3000";
const TENANT_ID = "t-phase5-demo-0001";

test.describe("User onboarding (Admin UI or diag fallback)", () => {
  test("Create STAFF user and verify Not authorised on Finance Reports", async ({ page, context }) => {
    const email = `staff.addons.${Date.now()}@nexa.local`;
    const password = "Staff#12345";

    // Try Admin UI path first
    let created = false;
    try {
      await page.goto(`${BASE}/admin/users`);
      const createBtn = page.getByRole("button", { name: /create user/i });
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.getByLabel(/email/i).fill(email);
        await page.getByLabel(/password/i).fill(password);
        await page.getByLabel(/role/i).selectOption("STAFF");
        await page.getByLabel(/tenant/i).fill(TENANT_ID);
        await page.getByRole("button", { name: /save|create/i }).click();
        await expect(page.getByText(email)).toBeVisible({ timeout: 5000 });
        created = true;
      }
    } catch {
      // Fall back to diag endpoint
    }

    if (!created) {
      const req = await pwRequest.newContext({ baseURL: BASE });
      const res = await req.post("/api/_diag/add-user", {
        data: { email, password, role: "STAFF", tenantId: TENANT_ID },
        headers: { "content-type": "application/json" },
      });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body?.ok).toBeTruthy();
      await req.dispose();
    }

    // Log in as the new STAFF and verify Not authorised on Finance Reports
    const userCtx = await context.browser()?.newContext();
    const userPage = await userCtx!.newPage();
    await userPage.goto(`${BASE}/login`);
    await userPage.getByLabel(/email/i).fill(email);
    await userPage.getByLabel(/password/i).fill(password);
    await Promise.all([
      userPage.waitForURL(/\/dashboard/),
      userPage.getByRole("button", { name: /sign in|log in|continue/i }).click(),
    ]);
    const resp = await userPage.goto(`${BASE}/finance/reports`);
    expect(resp?.status()).toBeLessThan(500);
    await expect(userPage.getByRole("heading", { name: /Not authorised/i })).toBeVisible();
    await userCtx!.close();
  });
});


