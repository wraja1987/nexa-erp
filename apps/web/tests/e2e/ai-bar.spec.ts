import { test, expect } from "@playwright/test";
const routes = ["/finance","/inventory","/manufacturing","/sales","/projects","/hr","/pos","/ai"];

async function ensureAuthed(page: import("@playwright/test").Page, target: string) {
  if (!page.url().includes("/login")) return;
  const base = process.env.PW_BASE_URL || "http://localhost:3000";
  const email = process.env.NEXA_E2E_EMAIL || "info@nexaai.co.uk";
  const password = process.env.NEXA_E2E_PASSWORD || "NexaSuper!123";
  const csrf = await page.request.get(`${base}/api/auth/csrf`);
  const json = await csrf.json();
  const token: string = json.csrfToken;
  await page.request.post(`${base}/api/auth/callback/credentials`, {
    form: { csrfToken: token, email, password },
  });
  await page.goto(target, { waitUntil: "load" });
}

test.describe("Nexa AI bar presence (authenticated via storageState)", () => {
  for (const route of routes) {
    test(`AI bar renders on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load" });
      await ensureAuthed(page, route);
      await expect(page.getByRole("complementary", { name: "Nexa AI Engine" })).toBeVisible();
      await expect(page).toHaveScreenshot(`ai-bar-${route.replace(/\//g, "_")}.png`);
    });
  }
});
