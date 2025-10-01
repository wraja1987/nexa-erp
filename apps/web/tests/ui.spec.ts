import { test, expect } from "@playwright/test";

test("core pages respond (allow redirect)", async ({ page }) => {
  for (const path of ["/login","/help","/alerts","/profile"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/(login|help|alerts|profile)/);
  }
});

test("kpi dashboard returns numeric fields", async ({ request }) => {
  const res = await request.get("/api/kpi/dashboard");
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  for (const k of ["totalRevenue","arBalance","apBalance","ordersToday"]) {
    expect(typeof json[k]).toBe("number");
  }
});
