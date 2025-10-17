import { test, expect } from "@playwright/test";

test.describe("Nexa ERP Login Page", () => {
  const base = process.env.BASE_URL || "https://app.nexaai.co.uk";

  test("renders approved login UI", async ({ page }) => {
    await page.goto(`${base}/login`, { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toHaveText(/Sign in to Nexa ERP/i);
    await expect(page.locator('input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[name="password"]').first()).toBeVisible();
    await expect(page.locator("text=Forgot password?")).toBeVisible();
    await expect(page.locator("text=Google")).toBeVisible();
    await expect(page.locator("text=Microsoft")).toBeVisible();
  });

  test("forgot password and verify pages respond 200", async ({ request }) => {
    const resForgot = await request.get(`${base}/auth/forgot-password`);
    expect(resForgot.status()).toBe(200);
    const resVerify = await request.get(`${base}/auth/verify-request`);
    expect(resVerify.status()).toBe(200);
  });

  test("providers endpoint lists all auth providers", async ({ request }) => {
    const res = await request.get(`${base}/api/auth/providers`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/email/);
    expect(body).toMatch(/google/);
    expect(body).toMatch(/azure/);
  });
});


