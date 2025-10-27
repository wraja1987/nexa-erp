import { test, expect } from "@playwright/test";
const routes = ["/dashboard"];
test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(process.env.E2E_EMAIL!);
  await page.getByPlaceholder("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
for (const r of routes) {
  test(`renders ${r}`, async ({ page }) => {
    await page.goto(r);
    await expect(page.locator('[data-testid="layout-sidebar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="layout-topbar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="ai-engine-bar"]').first()).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });
}