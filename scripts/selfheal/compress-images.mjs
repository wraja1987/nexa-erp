import { execSync } from 'node:child_process';
import { statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const KB = 1024;
const LIMIT = 300 * KB;
const exts = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

function listGitFiles(globLike) {
  // use git to list tracked assets only
  const out = execSync(`git ls-files -z -- ${globLike}`, { stdio: ['ignore', 'pipe', 'inherit'] });
  return out.toString('utf8').split('\0').filter(Boolean);
}

function fmt(n){ return (n/KB).toFixed(0)+' KB'; }

function tryRequire(mod) { try { return { ok:true, mod: require(mod) }; } catch { return { ok:false }; } }

function writeSummary(items, usedSharp, changed) {
  const lines = [];
  lines.push(`### Image compression summary`);
  lines.push(`- Threshold: ${LIMIT/KB} KB`);
  lines.push(`- Compressor used: ${usedSharp ? 'sharp' : 'none (not installed)'}`);
  lines.push(`- Files changed: ${changed.length}`);
  if (items.length) {
    lines.push('');
    lines.push(`**Oversized images:**`);
    items.forEach(i => lines.push(`- ${i.path} (${fmt(i.size)})`));
  } else {
    lines.push('');
    lines.push('No images over threshold were found.');
  }
  // Also echo to GH step summary if available
  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'), { flag: 'a' });
  }
  console.log(lines.join('\n'));
}

(async () => {
  try {
    // Collect candidate files
    const patterns = exts.map(e => `"**/*${e}"`).join(' ');
    const files = listGitFiles(patterns);

    const oversized = files
      .map(p => ({ path: p, size: statSync(p).size }))
      .filter(f => f.size > LIMIT);

    // If nothing to do, exit 0
    if (!oversized.length) {
      writeSummary([], false, []);
      process.exit(0);
    }

    // Attempt compression with sharp if present
    const { ok: hasSharp, mod: sharp } = tryRequire('sharp');
    const changed = [];

    if (hasSharp) {
      for (const f of oversized) {
        const lower = f.path.toLowerCase();
        try {
          if (lower.endsWith('.png')) {
            const buf = sharp(f.path);
            await buf.png({ compressionLevel: 9 }).toFile(f.path + '.tmp');
          } else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
            const buf = sharp(f.path);
            await buf.jpeg({ quality: 78, mozjpeg: true }).toFile(f.path + '.tmp');
          } else if (lower.endsWith('.webp')) {
            const buf = sharp(f.path);
            await buf.webp({ quality: 80 }).toFile(f.path + '.tmp');
          } else {
            // svg: skip auto-min here; leave as-is but report
            continue;
          }
          // If new file smaller, replace
          const after = statSync(f.path + '.tmp').size;
          if (after < f.size) {
            execSync(`mv "${f.path}.tmp" "${f.path}"`);
            changed.push({ path: f.path, before: f.size, after });
            execSync(`git add "${f.path}"`);
          } else {
            execSync(`rm -f "${f.path}.tmp"`);
          }
        } catch (e) {
          // Never fail CI here; just keep reporting
          try { execSync(`rm -f "${f.path}.tmp"`); } catch {}
          console.warn(`WARN: could not compress ${f.path}: ${e.message}`);
        }
      }
      writeSummary(oversized, true, changed);
      // Always succeed; PR step will only open if there are staged changes
      process.exit(0);
    } else {
      // No compressor installed: just report; do not fail the job
      writeSummary(oversized, false, []);
      process.exit(0);
    }
  } catch (e) {
    console.warn(`WARN: compress-images.mjs encountered a non-fatal error: ${e.message}`);
    // Do not fail the job
    process.exit(0);
  }
})();
