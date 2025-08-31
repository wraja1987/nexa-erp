#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ts = new Date().toISOString().replace(/[:.]/g,'').slice(0,15);
fs.mkdirSync('reports', { recursive: true });

const manifestPath = 'apps/web/public/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const iconsOk = ['icon-192.png','icon-512.png','maskable-192.png','maskable-512.png'].every(n=>
  (manifest.icons||[]).some(i=>i.src.endsWith(n)) && fs.existsSync('apps/web/public/'+n)
);
const logoOk = fs.existsSync('apps/web/public/logo-nexa.png') && !fs.existsSync('apps/web/public/logo-optra.png');

const loaderCssOk = fs.readFileSync('apps/web/src/styles/theme.css','utf8').includes('.ai-loader-n');
const loaderCompOk = fs.readFileSync('apps/web/src/components/AiLoader.tsx','utf8').includes('aria-live="polite"');

const mobileOk = fs.readFileSync('apps/mobile/app.json','utf8').includes('"name": "Nexa ERP"');

const checks = { logoOk, iconsOk, loaderCssOk, loaderCompOk, mobileOk };
const md = [
  `# Phase 5→6 Audit (${ts})`,
  '',
  '## Branding Checks',
  `- Logo present: ${logoOk ? 'YES':'NO'}`,
  `- PWA icons present: ${iconsOk ? 'YES':'NO'}`,
  `- AI loader wired (CSS+ARIA): ${loaderCssOk && loaderCompOk ? 'YES':'NO'}`,
  `- Mobile app.json updated: ${mobileOk ? 'YES':'NO'}`,
  '',
].join('\n');

fs.writeFileSync(`reports/phase5-to-6-audit-${ts}.md`, md);
fs.writeFileSync(`reports/phase5-to-6-audit-${ts}.json`, JSON.stringify({ ts, checks }, null, 2));
console.log('Saved phase5-to-6 audit reports');

