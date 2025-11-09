import { test, expect } from "@playwright/test";

test.describe("RBAC - STAFF restrictions", () => {
  test("STAFF sees Not authorised on Finance Reports", async ({ page, context }) => {
    await context.setExtraHTTPHeaders({ "x-role": "STAFF" });
    await page.goto("/finance/reports");
    await expect(page.getByRole("heading", { name: "Not authorised" })).toBeVisible();
  });
});


