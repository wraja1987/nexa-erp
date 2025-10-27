#!/usr/bin/env node
// Guard workflows: add paths-ignore and job-level if guards for self-heal
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const workflowsDir = path.join(repoRoot, '.github', 'workflows');
const guardSnippet = "!startsWith((github.head_ref || github.ref_name), 'chore/selfheal') && (github.event_name != 'pull_request' || !contains(toJson(github.event.pull_request.labels), 'self-heal'))";
const pathsIgnoreItems = [
  "'selfheal/**'",
  "'playwright.selfheal.config.js'",
  "'scripts/selfheal/**'",
  "'.github/workflows/verify-and-self-heal.yml'",
];

function getFiles(dir) {
  try { return fs.readdirSync(dir).filter(f => /\.ya?ml$/i.test(f)); } catch { return []; }
}

function leadingSpaces(line) {
  const m = line.match(/^(\s*)/);
  return m ? m[1] : '';
}

function ensurePathsIgnore(lines) {
  const out = [...lines];
  const onIdx = out.findIndex(l => /^on:\s*$/.test(l));
  if (onIdx === -1) return out; // nothing to do

  // find end of on: block
  const onIndent = leadingSpaces(out[onIdx]);
  let onEnd = out.length;
  for (let i = onIdx + 1; i < out.length; i++) {
    const ind = leadingSpaces(out[i]);
    if (out[i].trim() && ind.length <= onIndent.length && !/^\s*-\s/.test(out[i])) { onEnd = i; break; }
  }

  const events = ['push', 'pull_request'];
  for (const ev of events) {
    // locate event line inside on:
    let evIdx = -1;
    for (let i = onIdx + 1; i < onEnd; i++) {
      if (new RegExp(`^\\s*${ev}:\\s*$`).test(out[i])) { evIdx = i; break; }
    }
    if (evIdx === -1) continue; // event not present, skip

    const evIndent = leadingSpaces(out[evIdx]);
    const piHeader = `${evIndent}  paths-ignore:`;
    const itemPrefix = `${evIndent}    - `;

    // find end of event block
    let evEnd = onEnd;
    for (let i = evIdx + 1; i < onEnd; i++) {
      const ind = leadingSpaces(out[i]);
      if (out[i].trim() && ind.length <= evIndent.length) { evEnd = i; break; }
    }

    // does paths-ignore already exist in this block?
    let piIdx = -1;
    for (let i = evIdx + 1; i < evEnd; i++) {
      if (out[i].trim().startsWith('paths-ignore:')) { piIdx = i; break; }
    }

    if (piIdx === -1) {
      // Insert new paths-ignore block after event line
      const block = [piHeader, ...pathsIgnoreItems.map(x => itemPrefix + x)];
      out.splice(evIdx + 1, 0, ...block);
      // shift indices
      const added = block.length;
      onEnd += added; // future searches remain valid
    } else {
      // Merge items into existing block (append missing)
      // Determine indentation for items
      const piIndent = leadingSpaces(out[piIdx]);
      const desiredItemPrefix = piIndent + '  - ';
      const have = new Set();
      for (let i = piIdx + 1; i < evEnd; i++) {
        const line = out[i];
        if (!line.trim().startsWith('- ')) break;
        have.add(line.trim().slice(2));
      }
      const toAdd = pathsIgnoreItems.filter(x => !have.has(x.replace(/^'/, '').replace(/'$/, '')) && !have.has(x));
      for (const itm of toAdd) {
        out.splice(piIdx + 1, 0, desiredItemPrefix + itm);
        piIdx++;
        evEnd++;
        onEnd++;
      }
    }
  }
  return out;
}

function ensureJobIfGuards(lines) {
  const out = [...lines];
  const jobsIdx = out.findIndex(l => /^jobs:\s*$/.test(l));
  if (jobsIdx === -1) return out;
  const jobsIndent = leadingSpaces(out[jobsIdx]);
  const topEnd = out.length;

  // iterate over job headers
  for (let i = jobsIdx + 1; i < topEnd; i++) {
    const m = out[i].match(/^(\s+)([A-Za-z0-9_-]+):\s*$/);
    if (!m) continue;
    const jobIndent = m[1];
    const fieldIndent = jobIndent + '  ';

    // find existing if within this job
    let hasIf = false;
    let ifLineIdx = -1;
    let jobEnd = topEnd;
    for (let j = i + 1; j < topEnd; j++) {
      const line = out[j];
      const ind = leadingSpaces(line);
      if (line.trim() && ind.length <= jobIndent.length) { jobEnd = j; break; }
      if (new RegExp('^' + fieldIndent.replace(/ /g, ' ') + 'if:').test(line)) { hasIf = true; ifLineIdx = j; }
    }

    if (hasIf) {
      const line = out[ifLineIdx];
      if (line.includes("startsWith((github.head_ref || github.ref_name)")) {
        continue; // already guarded
      }
      const val = line.split(':').slice(1).join(':').trim();
      let inner;
      const mval = val.match(/^\$\{\{\s*(.*?)\s*\}\}$/);
      if (mval) inner = mval[1]; else inner = val;
      const wrapped = `${fieldIndent}if: ${{` + ` (${inner}) && ${guardSnippet} ` + `}}`;
      out[ifLineIdx] = wrapped;
    } else {
      const newIf = `${fieldIndent}if: ${{` + ` ${guardSnippet} ` + `}}`;
      out.splice(i + 1, 0, newIf);
      i++; // skip over inserted line
    }
  }
  return out;
}

function processFile(fp) {
  const src = fs.readFileSync(fp, 'utf8').split(/\r?\n/);
  let lines = src;
  if (!/verify-and-self-heal\.ya?ml$/.test(fp)) {
    lines = ensurePathsIgnore(lines);
    lines = ensureJobIfGuards(lines);
  }
  const out = lines.join('\n');
  if (out !== src.join('\n')) {
    fs.writeFileSync(fp, out);
    return true;
  }
  return false;
}

const files = getFiles(workflowsDir);
let updated = 0;
for (const f of files) {
  const fp = path.join(workflowsDir, f);
  const changed = processFile(fp);
  if (changed) { updated++; console.log(`Updated: ${f}`); }
}
console.log(`Workflows updated: ${updated}`);






