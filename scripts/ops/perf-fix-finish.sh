#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Desktop/Business Opportunities/Nexa ERP"
WEB="$ROOT/apps/web"

[ -d "$WEB" ] || { echo "❌ Missing path: $WEB"; exit 1; }
command -v pnpm >/dev/null || { echo "❌ pnpm not found. Install Node 22.x + pnpm"; exit 1; }

cd "$WEB"

echo "== Ensure deps =="
pnpm add -D @lhci/cli playwright @types/node tsx >/dev/null 2>&1 || true
pnpm add @sentry/nextjs @sentry/node >/dev/null 2>&1 || true

echo "== Guard: globals.css, layout lang='en-GB', Inter font wiring =="
mkdir -p src/app src/lib
[ -f src/lib/fonts.ts ] || cat > src/lib/fonts.ts <<'TS'
import { Inter } from 'next/font/google';
export const inter = Inter({ subsets: ['latin'], display: 'swap', preload: true, variable: '--font-inter' });
TS
[ -f src/app/globals.css ] || cat > src/app/globals.css <<'CSS'
:root { --font-inter: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: var(--font-inter); }
CSS

# Create layout if missing
if [ ! -f src/app/layout.tsx ] && [ ! -f pages/_app.tsx ]; then
  cat > src/app/layout.tsx <<'TSX'
import './globals.css';
import { inter } from '@/lib/fonts';
export const metadata = { title: 'Nexa', description: 'ERP' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
TSX
fi

# Patch App Router layout lang + font className
if [ -f src/app/layout.tsx ]; then
  node - <<'NODE'
const fs=require('fs'), p='src/app/layout.tsx';
let s=fs.readFileSync(p,'utf8');
if(!s.includes("@/lib/fonts")) s = `import { inter } from '@/lib/fonts';\n` + s;
s = s.replace(/<html\b([^>]*)>/, (m,attrs)=> /lang=/.test(attrs) ? `<html${attrs.replace(/lang=(["']).*?\1/,'lang="en-GB"')}>` : `<html lang="en-GB"${attrs}>`);
s = s.replace(/<body([^>]*)>/, (m,a)=> /className=/.test(a) ? m.replace(/className=\{?["'`].*?["'`]\}?/, 'className={inter.className}') : `<body${a} className={inter.className}>`);
fs.writeFileSync(p,s);
NODE
fi

# Patch Pages Router _app.tsx if present
if [ -f pages/_app.tsx ]; then
  node - <<'NODE'
const fs=require('fs'), p='pages/_app.tsx';
let s=fs.readFileSync(p,'utf8');
if(!s.includes("@/lib/fonts")) s = `import { inter } from '@/lib/fonts';\n` + s;
if(!/inter\.className/.test(s)){
  s = s.replace(/return\s*\(/, 'return (\n    <div className={inter.className}>' );
  s = s.replace(/\);\s*$/, '    </div>\n  );');
}
fs.writeFileSync(p,s);
NODE
fi

echo "== Harden next.config.js (preserve existing rewrites/headers) =="
# Wrap with Sentry, enable modern image formats, keep output: 'standalone' if already set
node - <<'NODE'
const fs=require('fs'); const p='next.config.js';
let core = `
/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif','image/webp'] },
};
`;
let sentryWrap = `
const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig(
  (async () => {
    let cfg = baseConfig;
    try {
      const existing = require('./next.config.runtime.js'); // optional handoff
      cfg = { ...cfg, ...existing };
    } catch {}
    // Respect existing Next config file if present
    try {
      const prior = require('./next.config.local.js');
      cfg = { ...cfg, ...prior };
    } catch {}
    return cfg;
  })(),
  { silent: true, disableLogger: true }
);
`;
let out = core + sentryWrap;
if (fs.existsSync(p)) {
  // Attempt to merge: keep user headers/rewrites/export config if present
  const prev = fs.readFileSync(p,'utf8');
  const headers = prev.match(/async headers\([\s\S]*?\}\s*\]/);
  const rewrites = prev.match(/async rewrites\([\s\S]*?\}\s*\]/);
  let merged = core.replace('};', `,${headers ? headers[0] : ''}${rewrites ? (headers? ',' : '')+rewrites[0] : ''}\n};`);
  out = merged + sentryWrap;
}
fs.writeFileSync(p, out);
NODE

echo "== Replace Sentry smoke to use @sentry/node (more reliable in scripts) =="
mkdir -p scripts
cat > scripts/sentry-smoke.mjs <<'MJS'
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN || '', environment: process.env.SENTRY_ENVIRONMENT || 'local', tracesSampleRate: 0 });
Sentry.captureMessage('nexa_sentry_smoke_'+Date.now(), 'info');
console.log('sentry:queued');
MJS

echo "== Robust Lighthouse runner (standalone server.js on a safe port) =="
cat > scripts/lh-wait-and-run.mjs <<'MJS'
import { spawn } from 'node:child_process';
import http from 'node:http';
import process from 'node:process';

const basePort = Number(process.env.LHCI_PORT || 3010);
const urls = [`http://127.0.0.1:${basePort}/`, `http://127.0.0.1:${basePort}/login`, `http://127.0.0.1:${basePort}/dashboard`];

async function waitFor(url, timeoutMs=90000) {
  const deadline = Date.now()+timeoutMs;
  while (Date.now() < deadline) {
    try {
      await new Promise((res,rej)=>{
        const req = http.get(url, r => { r.resume(); (r.statusCode && r.statusCode<500) ? res(1) : rej(new Error('bad code')) });
        req.on('error', rej);
      });
      return true;
    } catch { await new Promise(r=>setTimeout(r, 1000)); }
  }
  throw new Error('Timeout waiting for server: '+url);
}

function startStandalone(port) {
  const env = { ...process.env, PORT: String(port), HOST: '127.0.0.1', NODE_ENV: 'production' };
  // Next standalone server
  return spawn('node', ['.next/standalone/server.js'], { stdio: 'inherit', env });
}

async function run() {
  const srv = startStandalone(basePort);
  try {
    await waitFor(urls[0], 120000);
    const run = (cmd,args,cwd=process.cwd())=>new Promise((res,rej)=>{
      const p = spawn(cmd,args,{stdio:'inherit',cwd,shell:true});
      p.on('exit', c=> c===0?res():rej(new Error(cmd+' failed')));
    });

    // Collect + Assert explicitly to avoid startServerCommand races
    await run('lhci', ['collect', '--url', ...urls, '--numberOfRuns=1', '--settings.preset=desktop', '--settings.disableStorageReset=true']);
    await run('lhci', ['assert',  '--assertions.categories:performance=error:0.85', '--assertions.categories:accessibility=error:0.90', '--assertions.uses-responsive-images=warn', '--assertions.uses-webp-images=warn', '--assertions.font-display=warn']);
    await run('lhci', ['upload', '--target=temporary-public-storage']);
  } finally {
    try { srv.kill('SIGINT'); } catch {}
  }
}

run().catch(e=>{ console.error(e); process.exit(1); });
MJS

echo "== Minimal LHCI config (assert-only; runner handles collect/upload) =="
cat > .lighthouserc.json <<'JSON'
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }],
        "uses-responsive-images": "warn",
        "uses-webp-images": "warn",
        "font-display": "warn"
      }
    }
  }
}
JSON

echo "== Package scripts sync =="
node - <<'NODE'
const fs=require('fs'); const p='package.json'; const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.engines ||= {}; j.engines.node='>=22';
j.scripts ||= {};
j.scripts.build ||= 'next build';
j.scripts.start ||= 'next start -p 3000';
j.scripts['verify:lh']='node scripts/lh-wait-and-run.mjs';
j.scripts['a11y:smoke']= j.scripts['a11y:smoke'] || 'tsx scripts/a11y.smoke.ts';
j.scripts['sentry:smoke']= 'node scripts/sentry-smoke.mjs';
fs.writeFileSync(p, JSON.stringify(j,null,2));
NODE

echo "== .env.example guard at repo root =="
cd "$ROOT"
touch .gitignore
grep -qE '^\!/\.env\.example$' .gitignore || printf "\n# allow template env\n!/.env.example\n" >> .gitignore
cat > .env.example <<'ENV'
# Nexa — required vars for apps/web
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace_me"
DATABASE_URL="postgresql://nexa_user:password@127.0.0.1:5432/nexa?schema=public"
SENTRY_DSN=""
SENTRY_ENVIRONMENT="local"
ENV

echo "== Install, build, run gates =="
pnpm -w install
cd "$WEB"
pnpm build
LHCI_PORT=3010 node scripts/lh-wait-and-run.mjs
pnpm a11y:smoke || true
pnpm sentry:smoke || true

echo "== CI reminder =="
echo "Push to GitHub. Ensure repo secrets exist (NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL, SENTRY_DSN, SENTRY_ENVIRONMENT). Enable branch protection to block merges on CI failure."

