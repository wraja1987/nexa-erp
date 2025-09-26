import {execSync} from 'child_process'; import fs from 'fs'; import path from 'path';
const outDir='ops/site-backups'; fs.mkdirSync(outDir,{recursive:true});
const stamp=new Date().toISOString().slice(0,10).replace(/-/g,''); const zip=path.join(outDir,`nexa-website-hostinger-${stamp}.zip`);
execSync(`cd apps/web/public && zip -r "../../..//${zip}" . -x "**/.DS_Store"` , {stdio:'inherit'}); console.log('ZIP_BUILT:',zip);
