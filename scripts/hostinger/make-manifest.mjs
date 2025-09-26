import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const root = path.resolve('apps/web/public/website');
const ts = new Date().toISOString().replace(/[:-]/g,'').replace(/\..+/,'');
const out = path.resolve(`ops/site-backups/manifest-current-${ts}.txt`);
function listFiles(dir){
  const out=[]; (function walk(d){ for(const n of fs.readdirSync(d)){ const p=path.join(d,n); const s=fs.statSync(p); if(s.isDirectory()) walk(p); else out.push(p);} })(dir); return out;
}
const files = listFiles(root).sort();
const lines = files.map(f=>{
  const rel = path.relative(root, f);
  const hash = execSync(`shasum -a 256 "${f.replace(/"/g,'\\"')}"`).toString().split(' ')[0];
  return `${hash}  ${rel}`;
});
fs.mkdirSync(path.dirname(out),{recursive:true}); fs.writeFileSync(out, lines.join('\n')+'\n');
console.log('Wrote manifest', out);
