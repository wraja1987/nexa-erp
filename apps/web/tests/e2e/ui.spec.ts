import { test, expect } from "@playwright/test";

test("unauthenticated redirects to /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test.describe("after login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "info@nexaai.co.uk");
    await page.fill('input[name="password"]', "Wolfish123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test("finance invoices list renders", async ({ page }) => {
    await page.goto("/finance/invoices");
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("inventory items list renders", async ({ page }) => {
    await page.goto("/inventory/items");
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("sales leads list renders", async ({ page }) => {
    await page.goto("/sales/leads");
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("pos register page renders", async ({ page }) => {
    await page.goto("/pos/register");
    await expect(page.getByText(/Open Register|Close Register/)).toBeVisible();
  });

  test("ai documents list renders", async ({ page }) => {
    await page.goto("/ai/documents");
    await expect(page.getByRole("table")).toBeVisible();
  });
});


