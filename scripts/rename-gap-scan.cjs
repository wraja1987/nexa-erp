#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, list = []){
  const skip = /(^|\/)node_modules(\/|$)|(^|\/)dist(\/|$)|(^|\.)git(\/|$)|(^|\/)reports(\/|$)/;
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

const gaps = [];
const required = [
  'apps/web/public/logo-nexa.png',
  'apps/web/public/manifest.json',
];
for (const r of required){ if (!fs.existsSync(r)) gaps.push({ type:'missing', path:r }); }

const stamp = new Date().toISOString().replace(/[:.]/g,'').slice(0,15);
fs.mkdirSync('reports', { recursive: true });
const out = `reports/rename-gaps-${stamp}.json`;
fs.writeFileSync(out, JSON.stringify({ stamp, gaps }, null, 2));
const md = `# Rename Gap Scan (${stamp})\n\n${gaps.length? '## Gaps Found':'## No Gaps'}\n\n${gaps.map(g=>`- ${g.type}: ${g.path}`).join('\n')}`;
fs.writeFileSync(`reports/rename-gaps-${stamp}.md`, md);

console.log(gaps.length? 'FAIL: Gaps present' : 'PASS: No gaps');
console.table({ gaps: gaps.length });
if (gaps.length) process.exitCode = 1;


