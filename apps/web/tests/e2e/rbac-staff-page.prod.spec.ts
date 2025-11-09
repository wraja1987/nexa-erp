import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/e2e/.auth/staff.json" });

test.describe("RBAC - STAFF page access (prod)", () => {
  test("STAFF sees Not authorised on Finance Reports", async ({ page }) => {
    const base = process.env.PW_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
    const resp = await page.goto(`${base}/finance/reports`);
    expect(resp?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Not authorised" })).toBeVisible();
  });
});



