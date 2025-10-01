import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

(async () => {
  const base = (process.env.PW_BASE_URL || 'http://localhost:3010').replace(/\/$/, '');
  const urls = ['/login', '/dashboard'].map(p => base + p);
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const u of urls) {
    try {
      await page.goto(u, { waitUntil: 'domcontentloaded' });
      const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze();
      console.log(`a11y: ${u} violations=${results.violations.length}`);
      for (const v of results.violations.slice(0, 8)) console.log(` - ${v.id}: ${v.help}`);
    } catch (e) {
      console.error(`a11y: ${u} error:`, (e as Error).message);
    }
  }
  await browser.close();
})().catch(()=>process.exit(0));

