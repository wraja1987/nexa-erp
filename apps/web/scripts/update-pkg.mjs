import fs from 'fs';
const p='package.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.scripts=j.scripts||{};
j.scripts['verify:ui']='node scripts/verify-ui.js';
if (typeof j.scripts['test:e2e']==='undefined') j.scripts['test:e2e']='playwright test';
j.scripts['wire:ctas']='tsx scripts/cta-wire.ts';
fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n');
console.log('package.json updated');
