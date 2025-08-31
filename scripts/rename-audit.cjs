#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, list = []){
  const skip = /(^|\/)node_modules(\/|$)|(^|\/)dist(\/|$)|(^|\.)git(\/|$)|(^|\/)reports(\/|$)|(^|\/)\.next(\/|$)|(^|\/)coverage(\/|$)|(^|\/)\.turbo(\/|$)|pnpm-lock\.yaml$|package-lock\.json$|yarn\.lock$/;
  for (const entry of fs.readdirSync(dir)){
    const p = path.join(dir, entry);
    if (skip.test(p)) continue;
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, list); else list.push(p);
  }
  return list;
}

const root = process.cwd();
const files = walk(root);

const findings = [];
for (const f of files){
  const base = path.basename(f);
  if (/^\.env(\..+)?$/.test(base) || base === '.env' || base === '.env.bak') continue;
  try{
    const t = fs.readFileSync(f, 'utf8');
    // Ignore valid PR links to nexa-erp repo in acceptance script and this audit tool itself
    if (f.endsWith('scripts/ci/phase4-acceptance.sh')) continue;
    if (f.endsWith('scripts/rename-audit.cjs')) continue;
    if (f.endsWith('scripts/phase5-to-6-audit.cjs')) continue;
    if (/\bOptra\b|\boptra-erp\b|logo-optra\.png/.test(t)){
      findings.push(f);
    }
  }catch{}
}

const stamp = new Date().toISOString().replace(/[:.]/g,'').slice(0,15);
fs.mkdirSync('reports', { recursive: true });
const out = `reports/rename-audit-${stamp}.json`;
fs.writeFileSync(out, JSON.stringify({ stamp, findings, count: findings.length }, null, 2));

const md = `# Rename Audit (${stamp})\n\n- Matches: ${findings.length}\n\n${findings.map(f=>`- ${f}`).join('\n')}`;
fs.writeFileSync(`reports/rename-audit-${stamp}.md`, md);

console.log(`PASS: ${findings.length === 0}`);
console.table({ matches: findings.length });
if (findings.length) process.exitCode = 1;


