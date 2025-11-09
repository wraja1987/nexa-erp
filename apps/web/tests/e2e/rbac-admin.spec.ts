import { test, expect } from "@playwright/test";

test.use({ storageState: "tests/e2e/.auth/admin.json" });

test.describe("RBAC - ADMIN access", () => {
  test("ADMIN can view Finance Reports page", async ({ page }) => {
    const base = process.env.PW_BASE_URL || "http://localhost:3000";
    // debug base URL to ensure we are targeting the correct host
    console.log("PW_BASE_URL:", base);

    // Ensure deployment protection is bypassed when testing against protected Ready deployments
    if (process.env.VERCEL_BYPASS_TOKEN) {
      await page.goto(
        `${base}/?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=${process.env.VERCEL_BYPASS_TOKEN}`
      );
    }

    const response = await page.goto(`${base}/finance/reports`);
    console.log("navigated:", page.url(), "status:", response?.status());
    expect(response?.status()).toBe(200);
    await expect(page.getByText(/Not authorised/i)).toHaveCount(0);
  });
});


