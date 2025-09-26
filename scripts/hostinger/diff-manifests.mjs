import fs from 'fs'; import path from 'path';
const [,, prev, curr] = process.argv; if(!curr) throw new Error('Usage: node diff-manifests.mjs <prev.txt|empty> <curr.txt>');
const a = prev && fs.existsSync(prev) ? fs.readFileSync(prev,'utf8').trim().split('\n') : [];
const b = fs.readFileSync(curr,'utf8').trim().split('\n');
function mapIt(lines){ const m=new Map(); for(const line of lines){ const sp=line.split(/\s\s+/); if(sp.length>=2) m.set(sp.slice(1).join('  '), sp[0]); } return m; }
const A = mapIt(a); const B = mapIt(b);
const keys = new Set([...A.keys(), ...B.keys()]);
const changes=[];
for(const k of [...keys].sort()){
  if(!A.has(k)) changes.push(['ADDED', k]); else if(!B.has(k)) changes.push(['REMOVED', k]); else if(A.get(k)!==B.get(k)) changes.push(['CHANGED', k]);
}
const report = path.resolve(`ops/site-backups/diff-report-${Date.now()}.txt`);
fs.writeFileSync(report, changes.map(c=>c.join('\t')).join('\n')+'\n');
console.log('DIFF_REPORT', report);
