#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const targetDir = process.argv[2] || 'build_nexa_hostinger';
const labelToRoute = [
  { labels: ['Home'], route: '/' },
  { labels: ['Modules'], route: '/modules/' },
  { labels: ['Integrations & API','Integrations &amp; API','Integrations & API'], route: '/integrations/' },
  { labels: ['Security & Compliance','Security &amp; Compliance','Security & Compliance'], route: '/security/' },
  { labels: ['Pricing'], route: '/pricing/' },
  { labels: ['Resources'], route: '/resources/' },
  { labels: ['About'], route: '/about/' },
  { labels: ['Contact'], route: '/contact/' },
];

function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && p.endsWith('.html')) out.push(p);
  }
  return out;
}

function normalizeFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;

  // Dead anchors
  html = html.replace(/href="#"/g, 'href="/"');
  html = html.replace(/javascript:void\(0\)/g, '/');

  // Logo -> home
  html = html.replace(/<a([^>]*class="logo"[^>]*)href="[^"]*"([^>]*)>/gi, '<a$1href="/"$2>');

  // Map tab labels to routes while preserving attributes when possible
  for (const {labels, route} of labelToRoute) {
    for (const label of labels) {
      const labelRe = label.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
      const withHref = new RegExp(`<a([^>]*?)href="[^"]*"([^>]*)>\\s*${labelRe}\\s*</a>`, 'gi');
      const noHref   = new RegExp(`<a((?!href)[^>]*)>\\s*${labelRe}\\s*</a>`, 'gi');
      html = html.replace(withHref, (_, a1, a2) => `<a${a1}href="${route}"${a2}>${label}</a>`);
      html = html.replace(noHref,  (_, a1)      => `<a${a1} href="${route}">${label}</a>`);
    }
  }

  // Login / Sign in CTAs
  html = html.replace(/(<a[^>]*href=")[^"]*("[^>]*>\s*(?:Login|Sign\s*in)\s*<\/a>)/gi, `$1https://app.nexaai.co.uk$2`);

  // Normalize known bad routes
  html = html.replace(/href="\/status"/g, 'href="/"');
  html = html.replace(/href="\/legal\/[^"]*"/g, 'href="/about/"');
  html = html.replace(/href="\/docs\/[^"]*"/g, 'href="/resources/"');

  // Image path rewrite from /website/* to /assets/
  html = html.replace(/src="\/website\/[^"]+\/(\w+\.(?:png|svg|webp|jpg|jpeg))"/gi, 'src="/assets/$1"');
  html = html.replace(/src="logo-nexa\.png"/g, 'src="/logo-nexa.png"');

  // Footer phone/email policy
  html = html.replace(/Phone:[^<]*/gi, '');
  html = html.replace(/\+44[ 0-9-]+/g, '');
  html = html.replace(/Contact:[^<]*info@chiefaa\.com[^<]*/gi, 'Contact: info@chiefaa.com');

  // Inject footer grid CSS once
  if (!/footer nav,footer \.columns/.test(html)) {
    html = html.replace('</head>', '<style>footer nav,footer .columns,footer .cols,footer .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 16px} footer ul{list-style:none;margin:0;padding:0} footer li{margin:6px 0}</style></head>');
  }

  if (html !== before) fs.writeFileSync(filePath, html, 'utf8');
}

function main() {
  if (!fs.existsSync(targetDir)) {
    console.error(`Target directory not found: ${targetDir}`);
    process.exit(1);
  }
  const files = walk(targetDir);
  files.forEach(normalizeFile);
  console.log(`[normalize] processed ${files.length} HTML files in ${targetDir}`);
}

main();
