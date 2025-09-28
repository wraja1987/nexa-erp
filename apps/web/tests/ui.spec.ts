import { test, expect } from "@playwright/test";
test("core pages respond", async ({ page }) => {
  for (const path of ["/login","/help","/alerts","/profile"]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(path.replace("/", "\\/")));
  }
});
test("kpi endpoint returns JSON", async ({ request }) => {
  const res = await request.get("/api/kpi/dashboard");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(Array.isArray(json.kpis)).toBeTruthy();
});
