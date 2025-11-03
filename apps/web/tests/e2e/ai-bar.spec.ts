import { test, expect } from "./fixtures/auth";

const routes = [
  "/dashboard",
  "/finance",
  "/inventory",
  "/manufacturing",
  "/sales",
  "/projects",
  "/hr",
  "/pos",
  "/ai",
];

test.describe("Nexa AI bar presence", () => {
  for (const route of routes) {
    test(`AI bar renders on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("complementary", { name: "Nexa AI Engine" })).toBeVisible();
      await expect(page).toHaveScreenshot(`ai-bar-${route.replace(/\//g, "_")}.png`);
    });
  }
});


