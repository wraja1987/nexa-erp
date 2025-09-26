import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const root = path.resolve('apps/web/public/website');
const ts = new Date().toISOString().replace(/[:T-]/g,'').slice(0,8);
const outDir = path.resolve('ops/site-backups'); fs.mkdirSync(outDir,{recursive:true});
const outZip = path.join(outDir, `nexa-website-hostinger-${ts}.zip`);
execSync(`cd "${root}" && zip -r "${outZip}" .`, { stdio: 'inherit' });
console.log('Built ZIP', outZip);
