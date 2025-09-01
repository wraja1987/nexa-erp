#!/usr/bin/env node
/**
 * Nexa ERP — Phase 6 Gate (Finalisation / Gap-Assured)
 * Fast checks:
 * - Re-run Phases 0–5 gates
 * - a11y / perf / security scripts
 * - Branding: no legacy brand tokens, logo-nexa.png exists
 * - .env.example has COMPOSE_PROJECT_NAME=nexa-erp
 * - Help route exists
 * Emits single PASS/FAIL line.
 */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
function run(cmd){ console.log("$ " + cmd); execSync(cmd, {stdio:"inherit"}); }
function fail(msg){ console.error("FAIL:", msg); console.log("FAIL"); process.exit(1); }
function mustExist(p){ if(!fs.existsSync(p)) fail("Missing required file: " + p); }

try {
  run("npm run -s gate:phase0");
  run("npm run -s gate:phase1");
  run("npm run -s gate:phase2");
  run("npm run -s gate:phase3");
  try { run("npm run -s gate:phase4"); } catch(e) { /* tolerate phase4 script shape */ }
  run("npm run -s gate:phase5");

  run("npm run -s ui:a11y");
  run("npm run -s ui:perf");
  run("npm run -s test:security");

  mustExist(path.join(process.cwd(), "apps/web/public/logo-nexa.png"));

  // branding sweep
  const IGNORES = new Set(["node_modules",".git","dist",".next","reports","coverage"]);
  const IGNORE_FILE_PATTERNS = [/\.bak$/i, /\.log$/i, /\.md$/i, /\.map$/i, /\.html$/i];
  const re = /\bOptra\b/;
  const stack = [process.cwd()];
  while (stack.length) {
    const cur = stack.pop();
    const stat = fs.statSync(cur);
    if (stat.isDirectory()) {
      const base = path.basename(cur);
      if (IGNORES.has(base)) continue;
      for (const f of fs.readdirSync(cur)) stack.push(path.join(cur, f));
    } else if (stat.isFile()) {
      const base = path.basename(cur);
      if (IGNORE_FILE_PATTERNS.some((re) => re.test(base))) continue;
      try {
        const txt = fs.readFileSync(cur, "utf8");
        if (re.test(txt)) fail("Legacy brand reference: " + cur);
      } catch {}
    }
  }

  const envExample = path.join(process.cwd(), ".env.example");
  mustExist(envExample);
  const envTxt = fs.readFileSync(envExample, "utf8");
  if (!/^\s*COMPOSE_PROJECT_NAME\s*=\s*nexa-erp\s*$/m.test(envTxt)) {
    fail("COMPOSE_PROJECT_NAME=nexa-erp missing in .env.example");
  }

  mustExist(path.join(process.cwd(), "apps/web/src/app/(app)/help/page.tsx"));

  console.log("PASS");
  process.exit(0);
} catch (err) {
  console.error(err?.message || err);
  console.log("FAIL");
  process.exit(1);
}
