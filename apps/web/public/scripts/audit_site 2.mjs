#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const targetDir = process.argv[2] || 'build_nexa_hostinger';
const requiredRoutes = ['/', '/modules/', '/integrations/', '/security/', '/pricing/', '/resources/', '/about/', '/contact/'];

function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && p.endsWith('index.html')) out.push(p);
  }
  return out;
}

function auditFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const errs = [];
  for (const r of requiredRoutes) {
    if (!new RegExp(`href="${r.replace(/\//g, '\\/')}`,'g').test(html)) errs.push(`missing ${r}`);
  }
  if (!/<a[^>]*class="logo"[^>]*href="\/"/i.test(html)) errs.push('logo not home');
  if (/href="#"|javascript:void\(0\)/i.test(html)) errs.push('dead anchor present');
  if (/src="\/website\//i.test(html)) errs.push('stray /website image');
  if (/href="\/(status|legal\/|docs\/)/i.test(html)) errs.push('bad route present');
  if (/\+44|Phone:/i.test(html)) errs.push('phone present');
  return errs;
}

function main() {
  if (!fs.existsSync(targetDir)) {
    console.error(`Target directory not found: ${targetDir}`);
    process.exit(1);
  }
  const files = walk(targetDir);
  let fail = 0;
  for (const f of files) {
    const errs = auditFile(f);
    if (errs.length) {
      fail = 1;
      console.log(`[FAIL] ${f}`);
      errs.forEach(e => console.log('  - ' + e));
    }
  }
  if (!fail) console.log('PASS');
  process.exit(fail);
}

main();
