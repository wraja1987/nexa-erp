#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'website');
const OUT = path.join(ROOT, 'build_nexa_hostinger');
const ASSETS = path.join(OUT, 'assets');

const REQUIRED = [
  'home/index.html',
  'modules/index.html',
  'integrations/index.html',
  'security/index.html',
  'pricing/index.html',
  'resources/index.html',
  'about/index.html',
  'contact/index.html',
];

const globalStyles = `\
<style>
  /* Layout clarity and tab alignment */
  .nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 20px;border-bottom:1px solid #E6EAF2;background:#fff;position:sticky;top:0;z-index:50}
  .nav ul{display:flex;gap:18px;list-style:none;margin:0;padding:0;align-items:center}
  .nav a{color:#0F2747;text-decoration:none}
  .nav .btn.primary{background:#2E6BFF;color:#fff;border-radius:10px;padding:8px 12px}
  main,section{max-width:1200px;margin:0 auto;padding:16px}
  footer{border-top:1px solid #E6EAF2;margin-top:24px;padding:20px;background:#F7F9FC}
  footer .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 16px}
  footer ul{list-style:none;margin:0;padding:0}
  footer li{margin:6px 0}
  /* Pricing details */
  .pricing-card .details{display:none}
  .pricing-card[aria-expanded="true"] .details{display:block}
  .hero-image{display:block;max-width:100%;height:auto;margin:20px auto}
</style>`;

const canonicalNav = `\
<nav class="nav">
  <a class="logo" href="/"><img src="/logo-nexa.png" alt="Nexa logo" style="height:28px"/></a>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/modules/">Modules</a></li>
    <li><a href="/integrations/">Integrations &amp; API</a></li>
    <li><a href="/security/">Security &amp; Compliance</a></li>
    <li><a href="/pricing/">Pricing</a></li>
    <li><a href="/resources/">Resources</a></li>
    <li><a href="/about/">About</a></li>
    <li><a href="/contact/">Contact</a></li>
    <li><a class="btn primary" href="https://app.nexaai.co.uk">Login</a></li>
  </ul>
</nav>`;

const canonicalFooter = `\
<footer>
  <div class="grid">
    <section>
      <strong>Nexa ERP</strong>
      <p>AI-powered finance, operations and manufacturing — with clear access controls, full audit history, and practical compliance. Contact: info@chiefaa.com</p>
    </section>
    <nav>
      <h4>Product</h4>
      <ul>
        <li><a href="/modules/">Modules</a></li>
        <li><a href="/pricing/">Pricing</a></li>
      </ul>
    </nav>
    <nav>
      <h4>Company</h4>
      <ul>
        <li><a href="/about/">About</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </nav>
  </div>
</footer>`; // Note: Legal links removed per request

function ensureRequired() {
  for (const rel of REQUIRED) {
    const p = path.join(SRC, rel);
    if (!fs.existsSync(p)) throw new Error(`Missing page: ${p}`);
  }
}

function cleanOut() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  for (const d of ['about','contact','integrations','modules','pricing','resources','security']) {
    fs.mkdirSync(path.join(OUT, d), { recursive: true });
  }
  fs.mkdirSync(ASSETS, { recursive: true });
}

function copyPages() {
  const map = [
    ['home/index.html', 'index.html'],
    ['modules/index.html', 'modules/index.html'],
    ['integrations/index.html', 'integrations/index.html'],
    ['security/index.html', 'security/index.html'],
    ['pricing/index.html', 'pricing/index.html'],
    ['resources/index.html', 'resources/index.html'],
    ['about/index.html', 'about/index.html'],
    ['contact/index.html', 'contact/index.html'],
  ];
  for (const [srcRel, outRel] of map) {
    fs.copyFileSync(path.join(SRC, srcRel), path.join(OUT, outRel));
  }
}

function collectAssets() {
  const exts = ['.png','.svg','.jpg','.jpeg','.webp','.css','.js'];
  const seen = new Set();
  const copy = (p) => {
    const base = path.basename(p);
    if (seen.has(base)) return; // dedupe
    seen.add(base);
    fs.copyFileSync(p, path.join(ASSETS, base));
  };
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (exts.includes(path.extname(p).toLowerCase())) copy(p);
    }
  };
  walk(SRC);
  // Copy optional Assets/ folders if present
  const extraAssets = [path.join(ROOT,'Assets'), path.join(SRC,'Assets')];
  for (const dir of extraAssets) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir,f); if (fs.statSync(p).isFile()) copy(p);
      }
    }
  }

  // Rewrite CSS url(...) inside copied CSS files
  const cssFiles = fs.readdirSync(ASSETS).filter(f => f.toLowerCase().endsWith('.css'));
  for (const css of cssFiles) {
    const p = path.join(ASSETS, css);
    let txt = fs.readFileSync(p, 'utf8');
    txt = txt.replace(/url\(([^)]+)\)/gi, (m, grp) => {
      const raw = grp.trim().replace(/^['\"]|['\"]$/g,'');
      if (/^data:|^https?:/i.test(raw)) return m;
      const base = path.basename(raw.split('?')[0].split('#')[0]);
      if (!base) return m;
      return `url(/assets/${base})`;
    });
    fs.writeFileSync(p, txt, 'utf8');
  }
}

function rewriteHtmlFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Remove <base ...>
  html = html.replace(/<base\b[^>]*>/gi, '');

  // Ensure <head> exists
  if (!/<head[\s\S]*?<\/head>/i.test(html)) {
    html = html.replace(/<html[^>]*>/i, '$&\n<head></head>');
  }

  // Inject global styles (once)
  if (!/nav\{display:flex/.test(html)) {
    html = html.replace(/<\/head>/i, `${globalStyles}</head>`);
  }

  // Replace <nav> ... </nav>
  if (/<nav[\s\S]*?<\/nav>/i.test(html)) html = html.replace(/<nav[\s\S]*?<\/nav>/gi, canonicalNav);
  else html = html.replace(/<body[^>]*>/i, `$&${canonicalNav}`);

  // Replace/create footer
  if (/<footer[\s\S]*?<\/footer>/i.test(html)) html = html.replace(/<footer[\s\S]*?<\/footer>/gi, canonicalFooter);
  else html = html.replace(/<\/body>/i, `${canonicalFooter}</body>`);

  // Force logo image src normalization everywhere
  html = html.replace(/<img([^>]*?)src="[^"]*logo[^"]*"([^>]*)>/gi, '<img$1src="/logo-nexa.png"$2>');

  // Book / Request demo -> /contact/
  html = html.replace(/(<a[^>]*href=")[^"]*("[^>]*>\s*(?:Book|Request)\s+a\s+demo[^<]*<\/a>)/gi, `$1/contact/$2`);

  // Login / Sign in -> ERP
  html = html.replace(/(<a[^>]*href=")[^"]*("[^>]*>\s*(?:Login|Sign\s*in)\s*<\/a>)/gi, `$1https://app.nexaai.co.uk$2`);

  // Dead anchors -> /
  html = html.replace(/href="#"/g, 'href="/"');
  html = html.replace(/javascript:void\(0\)/g, '/');

  // Normalize unwanted routes
  html = html.replace(/href="\/status"/g, 'href="/"');
  html = html.replace(/href="\/legal\/[^"]*"/g, 'href="/about/"');
  html = html.replace(/href="\/docs\/[^"]*"/g, 'href="/resources/"');

  // Rewrite assets to /assets/
  html = html.replace(/(src|href)="([^"]+\.(?:png|svg|webp|jpg|jpeg|css|js))(#[^"]*|\?[^\"]*)?"/gi, (m, attr, url) => {
    if (/^https?:\/\//i.test(url)) return m;
    if (url.startsWith('/assets/') || url.startsWith('/logo-nexa.png')) return m;
    const base = path.basename(url.split('?')[0].split('#')[0]);
    return `${attr}="/assets/${base}"`;
  });

  // Pricing: fully open details on click and allow expanded state
  if (filePath.endsWith('/pricing/index.html')) {
    const script = `\
<script>
  (function(){
    function expand(card){ if(card){ card.setAttribute('aria-expanded','true'); var d=card.querySelector('.details'); if(d){ d.style.display='block'; }} }
    document.addEventListener('click', function(e){
      var a = e.target.closest('a,button'); if(!a) return;
      var txt = (a.textContent||'').trim().toLowerCase();
      if(txt.includes('view details')){ e.preventDefault(); var card=a.closest('.pricing-card')||a.parentElement; expand(card); }
    });
  })();
</script>`;
    html = html.replace(/<\/body>/i, script + '</body>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

function processHtml() {
  const files = [
    path.join(OUT, 'index.html'),
    path.join(OUT, 'modules/index.html'),
    path.join(OUT, 'integrations/index.html'),
    path.join(OUT, 'security/index.html'),
    path.join(OUT, 'pricing/index.html'),
    path.join(OUT, 'resources/index.html'),
    path.join(OUT, 'about/index.html'),
    path.join(OUT, 'contact/index.html'),
  ];
  for (const f of files) rewriteHtmlFile(f);
}

function ensureLogoAtRoot() {
  const candidates = [
    path.join(SRC, 'home/logo-nexa.png'),
    path.join(SRC, 'integrations/logo-nexa.png'),
    path.join(SRC, 'resources/logo-nexa.png'),
    path.join(ROOT, 'logo-nexa.png'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) { fs.copyFileSync(p, path.join(OUT, 'logo-nexa.png')); return; }
  }
  if (!fs.existsSync(path.join(OUT, 'logo-nexa.png'))) throw new Error('logo-nexa.png not found');
}

function insertHomepageHero() {
  const heroPng = path.join(ASSETS,'hero-laptop.png');
  const home = path.join(OUT,'index.html');
  if (!fs.existsSync(home)) return;
  let html = fs.readFileSync(home,'utf8');
  if (fs.existsSync(heroPng) && !/class="hero-image"/.test(html)) {
    html = html.replace(/<nav[\s\S]*?<\/nav>/i, (m) => m + '\n<img class="hero-image" src="/assets/hero-laptop.png" alt="Laptop showing Nexa ERP"/>');
    fs.writeFileSync(home, html, 'utf8');
  }
}

function writeHtaccess404() {
  const htaccess = `# Nexa ERP — Hostinger static site\nOptions -Indexes\nDirectoryIndex index.html\n<IfModule mod_rewrite.c>\n  RewriteEngine On\n  RewriteCond %{HTTPS} !=on\n  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]\n</IfModule>\nAddType image/svg+xml .svg .svgz\nAddType image/webp .webp\nAddType application/json .json\nAddType application/manifest+json .webmanifest\nAddType font/woff2 .woff2\nAddType font/woff .woff\n<IfModule mod_headers.c>\n  <FilesMatch \"\\.(ttf|ttc|otf|eot|woff|woff2|svg)$\">\n    Header set Access-Control-Allow-Origin \"*\"\n  </FilesMatch>\n  Header set X-Content-Type-Options \"nosniff\"\n  Header set Referrer-Policy \"strict-origin-when-cross-origin\"\n  Header always set X-Frame-Options \"SAMEORIGIN\"\n  Header set X-XSS-Protection \"1; mode=block\"\n</IfModule>\n<IfModule mod_deflate.c>\n  AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css text/javascript application/javascript application/x-javascript application/json image/svg+xml\n</IfModule>\n<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresDefault \"access plus 1h\"\n  ExpiresByType text/css \"access plus 7 days\"\n  ExpiresByType application/javascript \"access plus 7 days\"\n  ExpiresByType image/svg+xml \"access plus 30 days\"\n  ExpiresByType image/webp \"access plus 30 days\"\n  ExpiresByType image/png \"access plus 30 days\"\n  ExpiresByType image/jpeg \"access plus 30 days\"\n  ExpiresByType font/woff2 \"access plus 30 days\"\n</IfModule>\nErrorDocument 404 /404.html\n`;
  const notFound = '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found — Nexa ERP</title></head><body><h1>Not found</h1><p><a href="/">Go home</a> · <a href="/contact/">Contact</a></p></body></html>';
  fs.writeFileSync(path.join(OUT, '.htaccess'), htaccess, 'utf8');
  fs.writeFileSync(path.join(OUT, '404.html'), notFound, 'utf8');
}

function auditDeadLinks() {
  const files = [
    path.join(OUT, 'index.html'),
    path.join(OUT, 'modules/index.html'),
    path.join(OUT, 'integrations/index.html'),
    path.join(OUT, 'security/index.html'),
    path.join(OUT, 'pricing/index.html'),
    path.join(OUT, 'resources/index.html'),
    path.join(OUT, 'about/index.html'),
    path.join(OUT, 'contact/index.html'),
  ];
  for (const f of files) {
    const h = fs.readFileSync(f, 'utf8');
    if (/href="#"|javascript:void\(0\)/i.test(h)) throw new Error(`Dead anchor in ${f}`);
    if (!/<nav[\s\S]*?<\/nav>/i.test(h)) throw new Error(`Missing nav in ${f}`);
    if (!/<footer[\s\S]*?<\/footer>/i.test(h)) throw new Error(`Missing footer in ${f}`);
  }
}

function zipOutput() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
  const zip = `nexa-website-hostinger-${stamp}.zip`;
  execSync(`(cd ${JSON.stringify(OUT)} && zip -rq ../${JSON.stringify(zip)} .)`);
  console.log(zip);
}

function main() {
  ensureRequired();
  cleanOut();
  copyPages();
  collectAssets();
  ensureLogoAtRoot();
  processHtml();
  insertHomepageHero();
  writeHtaccess404();
  auditDeadLinks();
  zipOutput();
}

main();
