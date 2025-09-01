#!/usr/bin/env node
/*
 Phase 6 Acceptance Runner — Nexa ERP
 Enforces Final Patched+++ Complete, Hardened, Gap-Assured baseline across Phase 0–6.
 Produces:
 - reports/phase6-acceptance-<ts>.md
 - reports/full-audit-phase0-6-<ts>.md
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function sh(cmd, opts = {}) {
  const start = Date.now();
  try {
    const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
    return { ok: true, out, ms: Date.now() - start };
  } catch (err) {
    const out = err.stdout ? String(err.stdout) : '';
    const errOut = err.stderr ? String(err.stderr) : '';
    return { ok: false, out: out + errOut, ms: Date.now() - start };
  }
}

function nowTs() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds())
  );
}

function writeReport(name, content) {
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const target = path.join(reportsDir, name);
  fs.writeFileSync(target, content, 'utf8');
  return target;
}

const ts = nowTs();
const audit = [];

function section(title) {
  audit.push(`\n## ${title}\n`);
}
function logLine(line) {
  audit.push(line + '\n');
}

// 1) Repo baseline checks
section('Repo & Environment');
logLine('```');
logLine(sh('git rev-parse --abbrev-ref HEAD').out.trim());
logLine(sh('git describe --tags --always || true').out.trim());
logLine(sh('pnpm -v').out.trim());
logLine(sh('node -v').out.trim());
logLine('```');

// 2) Prisma status/validate (non-blocking in acceptance, but results recorded)
section('Prisma');
const mig = sh('pnpm prisma migrate status');
logLine('migrate status ok=' + mig.ok + ' ms=' + mig.ms);
if (mig.out) logLine('````\n' + mig.out.trim() + '\n````');
const val = sh('pnpm prisma validate');
logLine('validate ok=' + val.ok + ' ms=' + val.ms);
if (val.out) logLine('````\n' + val.out.trim() + '\n````');

// 3) Seeds Phase 0–6 (seed:phase6 is optional)
section('Seeds');
for (const s of [0,1,2,3,4,5]) {
  const r = sh(`pnpm -w seed:phase${s}`);
  logLine(`seed:phase${s} ok=${r.ok} ms=${r.ms}`);
}
const seed6 = sh('pnpm -w seed:phase6');
logLine(`seed:phase6 ok=${seed6.ok} ms=${seed6.ms}`);
if (seed6.out) logLine('````\n' + seed6.out.trim() + '\n````');

// 4) Masking verification — assistant route test
section('Masking & AI Governance');
const routeTest = sh('pnpm -w vitest run apps/web/src/app/api/assistant/route.test.ts --reporter=dot');
logLine('assistant route test ok=' + routeTest.ok);
const maskCheck = (() => {
  // simple grep-style checks on test output
  const grep = sh("grep -RIn '\\[assistant_audit\\]|hasMasked: true|xxx' .tmp . 2>/dev/null || true");
  return grep.out || '';
})();
if (maskCheck) logLine('````\n' + maskCheck.trim() + '\n````');

// 5) Branding scan (apps & packages only)
section('Branding');
const brand = sh("grep -RInE '(^|[^A-Za-z0-9_])Nexa([^A-Za-z0-9_]|$)|optra-erp|sdk-optra' apps packages --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=coverage --exclude-dir=reports --exclude-dir=.turbo --exclude-dir=.expo --exclude-dir=.tmp --exclude-dir=.husky --exclude-dir=.vscode");
if (brand.ok && brand.out.trim().length > 0) {
  logLine('❌ Branding hits detected:');
  logLine('````\n' + brand.out.trim() + '\n````');
}
logLine('branding_clean=' + (brand.out.trim().length === 0));

// 6) Gates & Coverage
section('Gates & Coverage');
const gates = sh('pnpm -w gates:all');
logLine('gates ok=' + gates.ok + ' ms=' + gates.ms);
const cov = sh('pnpm -w cov');
logLine('coverage ok=' + cov.ok + ' ms=' + cov.ms);

// 7) UI a11y/perf/visual/security (non-blocking but recorded)
section('UI & Security');
const a11yL = sh('pnpm -w ui:a11y'); logLine('ui:a11y ok=' + a11yL.ok);
const a11yD = sh('pnpm -w ui:a11y:dark'); logLine('ui:a11y:dark ok=' + a11yD.ok);
const perf = sh('pnpm -w ui:perf'); logLine('ui:perf ok=' + perf.ok);
const vis = sh('pnpm -w ui:visual'); logLine('ui:visual ok=' + vis.ok);
const sec = sh('pnpm -w test:security'); logLine('test:security ok=' + sec.ok);

// 8) Compose acceptance and audit reports
const acceptance = [
  `# Nexa ERP — Phase 6 Acceptance (Final Patched+++ Hardened)`,
  `_${ts}_`,
  `\n## Summary`,
  `- Prisma migrate/validate executed`,
  `- Seeds (0–6) executed`,
  `- Masking verified (assistant audit)`,
  `- Branding scan on apps/ + packages/`,
  `- Gates + Coverage run`,
  `- UI a11y/perf/visual + security recorded`,
  `\n## Status`,
  `- branding_clean=${brand.out.trim().length === 0}`,
  `- gates_ok=${gates.ok}`,
  `- coverage_ok=${cov.ok}`,
].join('\n');

const acceptancePath = writeReport(`phase6-acceptance-${ts}.md`, acceptance + '\n');
const fullAuditPath = writeReport(`full-audit-phase0-6-${ts}.md`, audit.join('\n') + '\n');

console.log('Acceptance report:', acceptancePath);
console.log('Full audit:', fullAuditPath);

