#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(process.env.HOME, 'Desktop/Nexa ERP CLEAN PUSH');
process.chdir(repoRoot);

function safeExists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function walk(dir, out = []) {
  if (!safeExists(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      // Skip node_modules and caches
      if (/node_modules|\.next|dist|build|\.cache|\.parcel-cache/.test(full)) continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const targets = [
  'apps/web/public/Extras/website',
  'apps/web/public/build_hostinger',
  'apps/web/public/build_hostinger_flat',
  'apps/web/public/build_nexa_hostinger',
  'apps/web/public'
].map(p => path.join(repoRoot, p));

const files = [];
for (const dir of targets) walk(dir, files);

const priceLike = /£\s*\d[\d,]*(?:\.\d+)?/gi;
const perMonth1 = /\s*\/\s*month\b/gi;
const perMonth2 = /\bper\s+month\b/gi;
const plansStart = /Plans?\s+start\s+from\s+£[\d,.]+\s*(?:\/\s*month|per\s*month)?/gi;
const cta = '<a href="/contact" class="cta-quote" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#4F46E5;color:#fff;text-decoration:none;font-weight:600;line-height:1.2;">Contact us for a quote</a>';

function replaceHtmlLike(code) {
  let out = code;
  // Headings with price -> CTA
  out = out.replace(/<h[1-6][^>]*>[\s\S]*?£\s*\d[\d,]*(?:\.\d+)?[\s\S]*?<\/h[1-6]>/gi, cta);
  // Any element with class price/plan-price -> CTA
  out = out.replace(/(<([^>]+)class="[^"]*(?:price|plan-price)[^"]*"[^>]*>)[\s\S]*?(<\/\2>)/gi, (_, open, tag, close) => `${open}${cta}${close}`);
  // Generic currency -> CTA
  out = out.replace(priceLike, 'Contact us for a quote');
  // Remove months tails and phrases
  out = out.replace(perMonth1, '').replace(perMonth2, '');
  out = out.replace(plansStart, 'Contact us for a quote');
  return out;
}

function replaceJson(code) {
  let out = code;
  out = out.replace(/"price(Text|Label)?"\s*:\s*"[^"]*"/gi, '"price$1":"Contact us for a quote"');
  out = out.replace(/"price"\s*:\s*\d[\d,.\s]*/gi, '"price":null');
  out = out.replace(priceLike, '"Contact us for a quote"');
  out = out.replace(perMonth1, '').replace(perMonth2, '');
  return out;
}

function replaceCode(code) {
  let out = code;
  out = out.replace(/\bprice(Text|Label)?\s*:\s*["']?£?\d[\d,.]*["']?/gi, 'price$1: "Contact us for a quote"');
  out = out.replace(priceLike, 'Contact us for a quote');
  out = out.replace(perMonth1, '').replace(perMonth2, '');
  return out;
}

let changed = 0;
for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  if (!['.html', '.htm', '.md', '.mdx', '.json', '.ts', '.tsx', '.js'].includes(ext)) continue;
  let code;
  try { code = fs.readFileSync(f, 'utf8'); } catch { continue; }
  let out = code;
  if (['.html', '.htm', '.md', '.mdx'].includes(ext)) out = replaceHtmlLike(code);
  else if (ext === '.json') out = replaceJson(code);
  else out = replaceCode(code);
  if (out !== code) {
    fs.writeFileSync(f, out, 'utf8');
    changed++;
  }
}

console.log(`[cta] Files changed: ${changed}`);

function sh(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

try { sh('git add -A'); } catch {}
try { sh('git commit -m "website(pricing): CTA contact-quote; neutralise static stubs"'); } catch {}
try { sh('git -c pack.window=0 -c pack.threads=1 -c pack.writeBitmaps=false push -u origin HEAD'); } catch (e) { console.error('push failed', e.message); }

const outDir = path.join(repoRoot, 'dist');
if (!safeExists(outDir)) fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0,14);
const zipPath = path.join(outDir, `nexa-website-pricing-contact-cta-${stamp}.zip`);
try {
  sh(`zip -qr '${zipPath}' apps/web/public -x '*/node_modules/*' '*/.DS_Store' '*/.next/*' '*/dist/*' '*/build/*'`);
  console.log('ZIP ready:', zipPath);
} catch {}


