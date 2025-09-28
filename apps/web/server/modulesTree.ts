import fs from 'fs';
import path from 'path';

/**
 * Builds a flat list of module entries from public/modules/*.json
 * Shape: { name: string; path: string }
 */
export function getModulesTree(): { name: string; path: string }[] {
  const rootA = path.join(process.cwd(), 'apps','web','public','modules');
  const rootB = path.join(process.cwd(), 'public','modules');
  const root = fs.existsSync(rootA) ? rootA : rootB;
  if (!fs.existsSync(root)) return [];
  const files = fs.readdirSync(root).filter(f => f.endsWith('.json'));
  const out: { name: string; path: string }[] = [];
  for (const file of files) {
    const name = file.replace(/\.json$/, '');
    // example mapping: core.help-docs -> /app/core.help/docs
    const p = '/app/' + name.replace(/\./g, '/');
    out.push({ name, path: p });
  }
  return out;
}
