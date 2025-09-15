import fs from "fs";
import path from "path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PREV_DIR = "apps/web/public/previews";
const LIST_PATH = path.join(PREV_DIR, "_index.json");
const VIEWPORTS = [
  { kind: "desktop", width: 1440, height: 900 },
  { kind: "tablet",  width: 834,  height: 1112 },
  { kind: "mobile",  width: 390,  height: 844 }
];

(async () => {
  const list = JSON.parse(fs.readFileSync(LIST_PATH, "utf8"));
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  for (const { route, jsonFile, area } of list) {
    for (const v of VIEWPORTS) {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
      const dir = path.join(PREV_DIR, v.kind);
      fs.mkdirSync(dir, { recursive: true });
      const base = (area === "admin" ? "admin." : "") + jsonFile.replace(/\.json$/,"");
      const shot = path.join(dir, base + ".png");
      await page.screenshot({ path: shot, fullPage: true });

      const results = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa"]).analyze();
      const rep = path.join(dir, base + ".axe.json");
      fs.writeFileSync(rep, JSON.stringify(results, null, 2));
    }
    console.log("Done:", route);
  }

  await browser.close();
})();



