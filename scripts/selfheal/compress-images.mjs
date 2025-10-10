// Non-fatal image compressor for CI self-heal
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const exts = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
const MAX = 300 * 1024; // 300kB

const hasSharp = (() => {
  try {
    const r = spawnSync('node', ['-e', "require.resolve('sharp')"], { stdio: 'ignore' });
    return r.status === 0;
  } catch { return false; }
})();

const root = process.cwd();
let scanned = 0, candidates = 0, compressed = 0, savedBytes = 0;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (p.includes('node_modules') || p.startsWith('.git')) continue;
    if (entry.isDirectory()) { yield* walk(p); }
    else { yield p; }
  }
}

for (const file of walk(root)) {
  scanned++;
  const ext = path.extname(file).toLowerCase();
  if (!exts.includes(ext)) continue;
  const stat = fs.statSync(file);
  if (stat.size <= MAX) continue;

  candidates++;
  if (ext === '.svg') { console.log(`INFO: skip SVG (report-only): ${file}`); continue; }
  if (!hasSharp) { console.log(`WARN: sharp not available; skip ${file}`); continue; }

  try {
    const sharp = (await import('sharp')).default;
    const buf = fs.readFileSync(file);
    const img = sharp(buf, { failOnError: false });
    let out;
    if (ext === '.png') out = await img.png({ quality: 80 }).toBuffer();
    else if (ext === '.webp') out = await img.webp({ quality: 80 }).toBuffer();
    else out = await img.jpeg({ quality: 80 }).toBuffer(); // jpg/jpeg fallback

    if (out.length < buf.length) {
      fs.writeFileSync(file, out);
      savedBytes += buf.length - out.length;
      compressed++;
      // stage for PR
      spawnSync('git', ['add', file], { stdio: 'ignore' });
      console.log(`OK: compressed ${file} -> ${(out.length/1024|0)}kB`);
    } else {
      console.log(`INFO: no smaller output for ${file}`);
    }
  } catch (e) {
    console.log(`WARN: compress failed for ${file}: ${e?.message || e}`);
  }
}

console.log(`SUMMARY: scanned=${scanned} large=${candidates} compressed=${compressed} saved=${savedBytes}B`);
process.exit(0);
