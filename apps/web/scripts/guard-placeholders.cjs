const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// List files under apps/web. Prefer git if available; otherwise walk the FS.
let files = [];
try {
  files = execSync("git ls-files -- 'apps/web/**'")
    .toString()
    .split('\n')
    .filter(Boolean);
} catch {
  const root = path.resolve(process.cwd(), 'apps/web');
  function walk(dir) {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (['node_modules', '.next', '.vercel'].includes(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else files.push(full);
    }
  }
  walk(root);
}

const bad = [];
for (const f of files) {
  if (!f || !fs.existsSync(f)) continue;
  try {
    const s = fs.readFileSync(f, 'utf8');
    if (s.includes('PLACEHOLDER') || s.includes('TODO UI')) bad.push(f);
  } catch {
    // Ignore unreadable/binary files
  }
}
if (bad.length) {
  console.error('❌ Build blocked: placeholder strings found in:\n' + bad.join('\n'));
  process.exit(1);
}
console.log('✅ No placeholders in apps/web.');


