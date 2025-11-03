import { test, expect } from "@playwright/test";

test("providers are credentials-only", async ({ request }) => {
  const res = await request.get("https://app.nexaai.co.uk/api/auth/providers");
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(Object.keys(data)).toEqual(["credentials"]);
});

test("forgot-password page renders", async ({ page }) => {
  await page.goto("https://app.nexaai.co.uk/forgot-password");
  await expect(page.getByText("Forgot password")).toBeVisible();
});

test("forgot-password POST works", async ({ request }) => {
  const res = await request.post("https://app.nexaai.co.uk/api/auth/forgot-password", {
    data: { email: "super@nexa.ai" },
  });
  expect(res.status()).toBe(200);
});

test("login page has credentials form and no OAuth", async ({ page }) => {
  await page.goto("https://app.nexaai.co.uk/login");
  await expect(page.locator('img[src="/logo-nexa.png"]')).toBeVisible();
  const form = page.locator('form[action="/api/auth/callback/credentials"][method="post"]');
  await expect(form).toBeVisible();
  await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
  const html = await page.content();
  expect(/Google/i.test(html)).toBeFalsy();
  expect(/Microsoft/i.test(html)).toBeFalsy();
});
