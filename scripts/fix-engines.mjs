import fs from 'fs';
import path from 'path';

const root = process.cwd();

function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && entry.name === 'package.json') out.push(p);
  }
  return out;
}

const files = walk(root);
let changed = 0;

for (const file of files) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));

  if (!json.packageManager) {
    json.packageManager = 'pnpm@10';
  }

  if (!json.engines) json.engines = {};
  const prev = json.engines.node;
  json.engines.node = '>=20 <21';

  if ('engine-strict' in json) {
    delete json['engine-strict'];
  }

  if (prev !== json.engines.node) {
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
    changed++;
    console.log(`Updated engines.node in: ${file} (${prev} -> ${json.engines.node})`);
  }
}

console.log(`Done. Updated ${changed} package.json files.`);
