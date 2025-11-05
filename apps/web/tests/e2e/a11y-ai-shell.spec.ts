import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

test.describe("A11y — header/sidebar/AI bar", () => {
  for (const route of routes) {
    test(`no critical violations on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load" });
      await ensureAuthed(page, route);
      await expect(page.getByRole("complementary", { name: "Nexa AI Engine" })).toBeVisible();

      const results = await new AxeBuilder({ page })
        .include('header[role="banner"]')
        .include('aside[role="navigation"]')
        .include('[data-testid="ai-bar"]')
        .withTags(["wcag2a","wcag2aa"]) // common baseline
        .analyze();

      const critical = results.violations.filter(v => v.impact === "critical");
      const serious = results.violations.filter(v => v.impact === "serious");
      if (serious.length) {
        console.error("[a11y-serious]", JSON.stringify(serious, null, 2));
      }
      if (critical.length) {
        console.error("[a11y-critical]", JSON.stringify(critical, null, 2));
      }
      expect([...critical, ...serious], `${route} has serious/critical a11y violations`).toHaveLength(0);
    });
  }
});


