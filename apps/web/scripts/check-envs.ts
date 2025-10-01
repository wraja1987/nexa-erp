import fs from 'fs';
import path from 'path';

const required = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'DATABASE_URL',
  'SENTRY_DSN',
  'SENTRY_ENVIRONMENT',
];

const roots = [path.join(process.cwd(), '..', '..')];
const files = ['.env.local', '.env.development', '.env.production']
  .flatMap(f => roots.map(r => path.join(r, f)));

let ok = true;
for (const f of files) {
  if (!fs.existsSync(f)) { console.log(`ℹ ${f} not present`); continue; }
  const txt = fs.readFileSync(f, 'utf8');
  const keys = new Set(
    txt.split(/\r?\n/)
      .map(l => l.split('=')[0].trim())
      .filter(Boolean)
  );
  const missing = required.filter(k => !keys.has(k));
  if (missing.length) { ok = false; console.log(`⚠ ${f} missing: ${missing.join(', ')}`); }
  else { console.log(`✅ ${f} has required keys`); }
}

if (!ok) process.exit(1);

