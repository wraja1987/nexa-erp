// Phase 5 Gate — high-level acceptance checks
// Run with: pnpm gate:phase5
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ok = (m) => console.log('PASS:', m);
const bad = (m) => { console.error('FAIL:', m); process.exitCode = 1; };

function fileExists(p) { return fs.existsSync(path.resolve(p)); }
function hasScript(script) {
  const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
  return pkg.scripts && Object.prototype.hasOwnProperty.call(pkg.scripts, script);
}

// 1) Industry & AI stubs visible in web app (already added in Phase 4, verify they remain)
const webPages = [
  'apps/web/src/app/(app)/dashboard/page.tsx',
  'apps/web/src/app/(app)/help/page.tsx',
  'apps/web/src/app/(app)/enterprise/consolidation/page.tsx',
  'apps/web/src/app/(app)/enterprise/intercompany/page.tsx',
  'apps/web/src/app/(app)/industry/manufacturing/page.tsx',
  'apps/web/src/app/(app)/industry/construction/page.tsx',
  'apps/web/src/app/(app)/industry/logistics/page.tsx',
  'apps/web/src/app/(app)/industry/retail/page.tsx',
  'apps/web/src/app/(app)/industry/saas-tech/page.tsx',
  'apps/web/src/app/(app)/industry/professional-services/page.tsx',
  'apps/web/src/app/(app)/ai/workflows/page.tsx',
  'apps/web/src/app/(app)/ai/runs/page.tsx',
  'apps/web/src/app/(app)/ai/audit-logs/page.tsx',
];
for (const p of webPages) fileExists(p) ? ok(`web route present: ${p}`) : bad(`missing web route: ${p}`);

// 2) Mobile parity: basic screens/checks exist (stub test will assert imports)
const mobileParityTests = [
  'apps/mobile/__tests__/parity.test.tsx'
];
for (const t of mobileParityTests) fileExists(t) ? ok(`mobile parity test present: ${t}`) : bad(`missing mobile parity test: ${t}`);

// 3) Scripts for Step B must exist
[
  'ui:nav:lint',
  'ui:a11y',
  'ui:a11y:dark',
  'ui:perf',
  'ui:visual',
  'test:security',
  'gate:phase5'
].forEach(s => hasScript(s) ? ok(`script present: ${s}`) : bad(`missing script: ${s}`));

// 4) CI workflow monitors phase-5/** branches
const wf = '.github/workflows/ci.yml';
if (fileExists(wf)) {
  const y = fs.readFileSync(wf, 'utf8');
  (/phase-5\/\*\*/.test(y)) ? ok('CI watches phase-5/**') : bad('CI not watching phase-5/** in ci.yml');
} else {
  bad('CI workflow missing at .github/workflows/ci.yml');
}

// 5) Goldens & SDK generation scripts still wired
['openapi:generate','sdk:build','golden:all'].forEach(s => hasScript(s) ? ok(`script present: ${s}`) : bad(`missing script: ${s}`));

// Final status
if (process.exitCode && process.exitCode !== 0) {
  console.error('Phase 5 gate: FAIL');
  process.exit(process.exitCode);
} else {
  console.log('Phase 5 gate: OK');
}


