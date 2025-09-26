import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const zip = process.argv[2]; if(!zip) throw new Error('ZIP path required');
const ts = new Date().toISOString().replace(/[:-]/g,'').replace(/\..+/,'');
const out = path.resolve(`ops/site-backups/manifest-${path.basename(zip).replace(/\.zip$/,'')}.txt`);
const tmp = path.resolve('.tmp-zip'); fs.rmSync(tmp,{recursive:true,force:true}); fs.mkdirSync(tmp);
execSync(`unzip -q "${zip}" -d "${tmp}"`);
function listFiles(dir){ const out=[]; (function walk(d){ for(const n of fs.readdirSync(d)){ const p=path.join(d,n); const s=fs.statSync(p); if(s.isDirectory()) walk(p); else out.push(p);} })(dir); return out; }
const root = tmp; const files = listFiles(root).sort();
const lines = files.map(f=>{ const rel = path.relative(root, f); const hash = execSync(`shasum -a 256 "${f.replace(/"/g,'\\"')}"`).toString().split(' ')[0]; return `${hash}  ${rel}`; });
fs.writeFileSync(out, lines.join('\n')+'\n'); fs.rmSync(tmp,{recursive:true,force:true});
console.log('Wrote manifest for ZIP', out);
