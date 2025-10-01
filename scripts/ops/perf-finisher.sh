#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Desktop/Business Opportunities/Nexa ERP"
WEB="$ROOT/apps/web"

[ -d "$WEB" ] || { echo "❌ Missing path: $WEB"; exit 1; }
command -v pnpm >/dev/null || { echo "❌ pnpm not found. Install Node 22.x + pnpm"; exit 1; }

echo "== Wire Inter font into layout or _app =="
cd "$WEB"
mkdir -p src/lib src/app

# Ensure font helper exists
if [ ! -f src/lib/fonts.ts ]; then
  cat > src/lib/fonts.ts <<'TS'
import { Inter } from 'next/font/google';
export const inter = Inter({ subsets: ['latin'], display: 'swap', preload: true, variable: '--font-inter' });
TS
fi

# Try App Router first
if [ -f src/app/layout.tsx ]; then
  node - <<'NODE'
const fs=require('fs'), p='src/app/layout.tsx';
let s=fs.readFileSync(p,'utf8');
if(!s.includes("@/lib/fonts")) s = `import { inter } from '@/lib/fonts';\n` + s;
if(!/lang=/.test(s)) s = s.replace(/<html([^>]*)>/, '<html lang="en-GB"$1>');
if(/<body[^>]*>/.test(s)){
  s = s.replace(/<body([^>]*)>/, (m,a)=>`<body${a} className={\`${'${'}inter.className${'}'}\`}>`);
} else {
  s = s.replace(/return\s*\(\s*<html[^>]*>\s*<body([^>]*)>/, (m,a)=>`return (<html lang=\"en-GB\"><body${a} className={\`${'${'}inter.className${'}'}\`}>`);
}
fs.writeFileSync(p,s);
NODE
elif [ -f pages/_app.tsx ]; then
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
else
  mkdir -p src/app; cat > src/app/layout.tsx <<'TSX'
import './globals.css';
import { inter } from '@/lib/fonts';
export const metadata = { title: 'Nexa', description: 'ERP' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang=\"en-GB\">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
TSX
fi

echo "== Allow tracked .env.example at repo root =="
cd "$ROOT"
touch .gitignore
if ! grep -qE '^\!/\.env\.example$' .gitignore; then
  printf "\n# allow template env\n!/.env.example\n" >> .gitignore
fi

echo "== Create/update .env.example (template) =="
cat > .env.example <<'ENV'
# Nexa — required vars for apps/web
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace_me"
DATABASE_URL="postgresql://nexa_user:password@127.0.0.1:5432/nexa?schema=public"
SENTRY_DSN=""
SENTRY_ENVIRONMENT="local"
ENV

echo "== Install deps (workspace) =="
pnpm -w install

echo "== Env sanity check =="
cd "$WEB"
pnpm verify:envs || { echo "⚠ Missing required keys in one of .env.{local,development,production} at repo root"; }

echo "== Build =="
pnpm build

echo "== Lighthouse gate (perf ≥0.85, a11y ≥0.90) =="
node scripts/lh-wait-and-run.mjs

echo "== Optional: a11y smoke (report-only) =="
pnpm a11y:smoke || true

echo "== Optional: Sentry smoke (set SENTRY_DSN first) =="
pnpm sentry:smoke || true

cat <<'NEXT'
== DONE ==
Local gates are wired. CI workflow (./.github/workflows/ci.yml) is present.
Complete these in GitHub:
1) Add repository secrets (GitHub → Settings → Secrets and variables → Actions):
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - DATABASE_URL
   - SENTRY_DSN
   - SENTRY_ENVIRONMENT
2) Enable Branch protection on main to require the CI workflow to pass before merging.
NEXT

