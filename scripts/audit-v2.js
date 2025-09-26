const fs = require('fs');
const path = require('path');

const DIR = 'apps/web/public/modules';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
let enhanced = 0, basic = 0;

function check(file){
  const p = path.join(DIR, file);
  let j = {};
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch {}
  const kpis = Array.isArray(j.kpis) ? j.kpis.length : 0;
  const hasQL = !!(j.quickLinks && Array.isArray(j.quickLinks.items) && j.quickLinks.items.length);
  const hasInsights = !!(j.insights && Array.isArray(j.insights.items) && j.insights.items.length);
  const hasAI = !!j.aiEngine;
  const dataKey = ['table','list','uploader'].find(k => j[k]);
  const hasData = !!dataKey;
  const grid = j.layout && Array.isArray(j.layout.grid) ? j.layout.grid.length : 0;
  const ok = (kpis >= 3) && hasQL && hasInsights && hasAI && hasData && (grid >= 4);
  if (ok) enhanced++; else basic++;
  return { file, status: ok ? 'ENHANCED' : 'BASIC', checks: { kpis, quickLinks: hasQL, insights: hasInsights, aiEngine: hasAI, data: dataKey || false, grid } };
}

const results = files.map(check);
console.log('=== Audit v2 ===');
for (const r of results) {
  const c = r.checks;
  console.log(`${r.file} [${r.status}] (KPIs:${c.kpis} · QL:${c.quickLinks?'Y':'N'} · AIins:${c.insights?'Y':'N'} · AI:${c.aiEngine?'Y':'N'} · Data:${c.data||'N'} · Grid:${c.grid})`);
}
console.log(`\nTotal: ${files.length}`);
console.log(`ENHANCED: ${enhanced}`);
console.log(`BASIC: ${basic}`);
if (basic>0){
  console.log('\nBASIC files:');
  for (const r of results) if (r.status==='BASIC') console.log('-', r.file);
}








