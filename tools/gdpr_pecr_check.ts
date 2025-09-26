import { readFileSync, existsSync } from "fs";

const mustPages = [
  "apps/web/src/app/privacy/page.tsx",
  "apps/web/src/app/cookies/page.tsx",
  "apps/web/src/app/accessibility/page.tsx",
  "apps/web/src/app/security/page.tsx",
  "apps/web/src/app/compliance/page.tsx"
];

const okPages = mustPages.every(p => existsSync(p));

let plausibleGated = false;
try {
  const layout = readFileSync("apps/web/src/app/layout.tsx", "utf8");
  plausibleGated = /consent\s*===\s*['\"]granted['\"]/i.test(layout) || /if\s*\(\s*hasConsent\s*\)/i.test(layout);
} catch {}

console.log(JSON.stringify({ okPages, plausibleGated }, null, 2));







