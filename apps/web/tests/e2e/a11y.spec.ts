import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test.describe("A11y (serious/critical must be 0)", () => {
  test("login", async ({ page, baseURL }) => {
    const url = new URL("/login", baseURL!).toString();
    await page.goto(url, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a","wcag2aa"])
      .include("body")
      .analyze();
    const issues = results.violations.filter(v => ["serious","critical"].includes(v.impact || ""));
    expect.soft(issues, JSON.stringify(issues, null, 2)).toHaveLength(0);
  });

  test("dashboard (public in CI via LOCAL_LH=1)", async ({ page, baseURL }) => {
    const url = new URL("/dashboard", baseURL!).toString();
    await page.goto(url, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a","wcag2aa"])
      .include("body")
      .analyze();
    const issues = results.violations.filter(v => ["serious","critical"].includes(v.impact || ""));
    expect.soft(issues, JSON.stringify(issues, null, 2)).toHaveLength(0);
  });
});
