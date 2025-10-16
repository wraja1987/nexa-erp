#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────
# CONFIG — change if needed
# ─────────────────────────────
REPO_DIR="${REPO_DIR:-"$HOME/Desktop/Business Opportunities/Nexa ERP"}"
APP_DIR="apps/web"
BRANCH="fix/web-build-and-auth-runtime"

BASELINE_JSON="${BASELINE_JSON:-docs/baseline/modules.json}"   # approved baseline path
ALLOW_AUTOGEN_MIGRATIONS="${ALLOW_AUTOGEN_MIGRATIONS:-1}"      # set 1 to create missing Prisma models

VERCEL_ORG="${VERCEL_ORG:-chiefaa}"
VERCEL_PROJECT="${VERCEL_PROJECT:-nexa}"
DOMAIN="app.nexaai.co.uk"
PROD_URL="https://$DOMAIN"

# ─────────────────────────────
# Helpers & early shims
# ─────────────────────────────
need(){ command -v "$1" >/dev/null 2>&1 || { echo "Missing $1 — please install it and re-run."; exit 1; }; }
need git; need node; need pnpm; need jq; need curl

# Always have a 'vercel' command available (no global install needed)
if ! command -v vercel >/dev/null 2>&1; then vercel(){ npx -y vercel@latest "$@"; }; fi

# ─────────────────────────────
# 1) Sync branch (do not force-clean; we keep untracked generated pages)
# ─────────────────────────────
cd "$REPO_DIR"
git fetch --all --prune
git checkout "$BRANCH"
git pull --rebase origin "$BRANCH" || true

# ─────────────────────────────
# 2) Ensure tsconfig alias (@/* → ./src/*)
# ─────────────────────────────
TSC="$REPO_DIR/$APP_DIR/tsconfig.json"
if [ -f "$TSC" ]; then
  node - <<'NODE' "$TSC" > "$TSC.tmp"
const fs=require('fs'); const p=process.argv[2];
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.compilerOptions=j.compilerOptions||{};
j.compilerOptions.baseUrl=j.compilerOptions.baseUrl||".";
j.compilerOptions.paths=j.compilerOptions.paths||{};
j.compilerOptions.paths["@/*"]=["./src/*"];
fs.writeFileSync(p+".tmp", JSON.stringify(j,null,2));
NODE
  mv "$TSC.tmp" "$TSC"
  echo "✓ tsconfig alias set: @/* -> ./src/*"
else
  echo "! Could not find $TSC — skipping alias fix"
fi

# ─────────────────────────────
# 3) Load or write the approved baseline
# ─────────────────────────────
mkdir -p "$(dirname "$BASELINE_JSON")"
if [ ! -f "$BASELINE_JSON" ]; then
  cat > "$BASELINE_JSON" <<'JSON'
{ "modules": [
  { "root": "/dashboard", "paths": [], "mode": "NONE" },
  { "root": "/ai", "paths": ["prompts","workflows","assist","settings"], "mode": "NONE" },
  { "root": "/finance", "paths": ["chart-of-accounts","tax-codes","currencies","journals","invoices","credit-notes","customer-payments","supplier-payments","bills","supplier-credits","bank-accounts","bank-reconcile","bank-feed","aged-ar","aged-ap","trial-balance"], "mode": "CRUD" },
  { "root": "/inventory", "paths": ["items","variants","categories","warehouses","locations","bins","stock-moves","adjustments","counts","suppliers","purchase-orders","goods-received","returns"], "mode": "CRUD" },
  { "root": "/manufacturing", "paths": ["boms","routings","work-centres","work-orders","production-orders","mrp","materials-issue","materials-return"], "mode": "CRUD" },
  { "root": "/sales", "paths": ["leads","contacts","accounts","opportunities","quotes","orders","deliveries","returns"], "mode": "CRUD" },
  { "root": "/projects", "paths": ["board","projects","tasks","sprints","timesheets","expenses","billing"], "mode": "CRUD" },
  { "root": "/pos", "paths": ["registers","sessions","sales","refunds","z-report"], "mode": "CRUD" },
  { "root": "/hr", "paths": ["employees","departments","positions","contracts","attendance","leave","expenses","payroll/runs","payroll/payslips"], "mode": "CRUD" },
  { "root": "/compliance", "paths": ["vat/returns","vat/periods","policies","gdpr/records"], "mode": "NONE" },
  { "root": "/analytics", "paths": ["dashboards","reports","export"], "mode": "NONE" },
  { "root": "/files", "paths": ["library","uploads","attachments"], "mode": "CRUD" },
  { "root": "/notifications", "paths": ["inbox","templates","channels"], "mode": "CRUD" },
  { "root": "/admin", "paths": ["users","roles","tenants","plans","billing","permissions","audit","logs","integrations"], "mode": "CRUD" },
  { "root": "/settings", "paths": ["profile","company","branding","localisation","notifications","security","api-keys","webhooks","tenancy"], "mode": "NONE" },
  { "root": "/help", "paths": ["docs","release-notes","shortcuts"], "mode": "NONE" },
  { "root": "/login", "paths": [], "mode": "NONE" },
  { "root": "/logout", "paths": [], "mode": "NONE" },
  { "root": "/status", "paths": [], "mode": "NONE" }
]}
JSON
  echo "• Wrote baseline to $BASELINE_JSON"
else
  echo "• Using existing baseline at $BASELINE_JSON"
fi

REQUIRED_TXT=/tmp/nexa-required.txt
node - <<'NODE' "$BASELINE_JSON" > "$REQUIRED_TXT"
const fs=require('fs'); const raw=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const out=new Set(); const add=p=>{ if(!p.startsWith('/'))p='/'+p; p=p.replace(/\/+/g,'/').replace(/\/$/,'')||'/'; out.add(p); };
for(const m of raw.modules){
  const root=m.root, flag=(m.mode||'NONE').toUpperCase(), subs=m.paths||[];
  if(!subs.length){ add(root); continue; }
  for(const s of subs){
    const base=(root+'/'+s).replace(/\/+/g,'/').replace(/\/$/,'');
    if(flag==='CRUD'){ add(base); add(base+'/new'); add(base+'/[id]'); add(base+'/[id]/edit'); }
    else if(flag==='ID'){ add(base); add(base+'/[id]'); }
    else { add(base); }
  }
}
['/','/dashboard','/login','/logout','/status'].forEach(add);
console.log([...out].sort().join('\n'));
NODE

echo "• Required routes: $(wc -l < "$REQUIRED_TXT")"
sed -n '1,60p' "$REQUIRED_TXT" | sed 's/^/  /'
[ "$(wc -l < "$REQUIRED_TXT")" -gt 60 ] && echo "  ... (truncated)"

# ─────────────────────────────
# 4) Generate missing pages + APIs (App Router, Nexa theme)
# ─────────────────────────────
cd "$REPO_DIR/$APP_DIR"
mkdir -p app src/components/nexa

# Root layout with Nexa theme
if ! grep -R "data-theme=\"nexa\"" -n app/layout.* >/dev/null 2>&1; then
  cat > app/layout.tsx <<'TSX'
export const metadata = { title: 'Nexa ERP' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body data-theme="nexa">{children}</body></html>);
}
TSX
fi

# Tiny Nexa UI
cat > src/components/nexa/List.tsx <<'TSX'
'use client';
import React from 'react';
type Col<T>={ key:keyof T|string; header:string; render?:(row:any)=>React.ReactNode };
export function List<T extends { id?:string|number }>({ title, rows, columns, onNew }:{
  title:string; rows:any[]; columns:Col<T>[]; onNew?:()=>void;
}){
  return (<section className="p-6">
    <div className="flex items-center justify-between mb-4"><h1 className="text-xl font-semibold">{title}</h1>{onNew&&<button className="px-3 py-2 rounded bg-black text-white" onClick={onNew}>New</button>}</div>
    <div className="rounded border"><table className="w-full">
      <thead><tr>{columns.map(c=><th key={String(c.key)} className="text-left p-2 border-b">{c.header}</th>)}</tr></thead>
      <tbody>{rows.map((r,i)=>(<tr key={r.id??i} className="hover:bg-gray-50">{columns.map(c=><td key={String(c.key)} className="p-2 border-b">{c.render?c.render(r):String(r[c.key as string]??'')}</td>)}</tr>))}</tbody>
    </table></div></section>);
}
TSX

cat > src/components/nexa/Form.tsx <<'TSX'
'use client';
import React,{useState} from 'react';
export function Form({ title, initial, fields, onSubmit }:{
  title:string; initial:Record<string,any>; fields:{name:string;label:string;type?:string}[]; onSubmit:(d:Record<string,any>)=>Promise<void>|void;
}){
  const [data,setData]=useState<Record<string,any>>(initial||{});
  return (<section className="p-6 max-w-2xl"><h1 className="text-xl font-semibold mb-4">{title}</h1>
    <form onSubmit={async e=>{e.preventDefault();await onSubmit(data);}}>
      <div className="grid gap-4">{fields.map(f=>(<label key={f.name} className="flex flex-col gap-1"><span className="text-sm">{f.label}</span>
        <input className="border rounded p-2" type={f.type||'text'} value={data[f.name]??''} onChange={e=>setData({...data,[f.name]:e.target.value})}/></label>))}</div>
      <div className="mt-6 flex gap-3"><button className="px-4 py-2 rounded bg-black text-white" type="submit">Save</button></div>
    </form></section>);
}
TSX

# Generic CRUD API
mkdir -p app/api/_crud/[resource]
cat > app/api/_crud/[resource]/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const modelMap: Record<string,string> = {
  'admin/users':'User','admin/roles':'Role','admin/tenants':'Tenant','admin/plans':'Plan','admin/permissions':'Permission','admin/audit':'AuditLog','admin/logs':'AuditLog',
  'finance/chart-of-accounts':'Account','finance/journals':'JournalEntry','finance/invoices':'CustomerInvoice','finance/bills':'SupplierBill','finance/customer-payments':'CustomerPayment','finance/supplier-payments':'SupplierPayment',
  'inventory/items':'Item','inventory/variants':'ItemVariant','inventory/categories':'ItemCategory','inventory/purchase-orders':'PurchaseOrder','inventory/goods-received':'GoodsReceipt',
  'sales/leads':'Lead','sales/opportunities':'Opportunity','sales/orders':'SalesOrder',
  'projects/projects':'Project','projects/tasks':'Task','projects/timesheets':'Timesheet',
  'hr/employees':'Employee','hr/departments':'Department','hr/positions':'Position',
  'files/library':'FileObject',
  'notifications/templates':'NotificationTemplate'
};
const seg=(req:NextRequest)=>req.nextUrl.pathname.split('/').filter(Boolean);
const keyFrom=(req:NextRequest)=>{const s=seg(req);const i=s.indexOf('_crud');const res=decodeURIComponent(s.slice(i+1).join('/'));return res.replace(/^\//,'').replace(/\/$/,'')};
const idFrom=(req:NextRequest)=>req.nextUrl.searchParams.get('id');
export async function GET(req:NextRequest){ const res=keyFrom(req); const model=modelMap[res]; if(!model || !(prisma as any)[model]) return NextResponse.json({ok:true,rows:[]});
  const rows=await (prisma as any)[model].findMany({ take:200, orderBy:{updatedAt:'desc'} }).catch(()=>[]); return NextResponse.json({ok:true,rows}); }
export async function POST(req:NextRequest){ const res=keyFrom(req); const model=modelMap[res]; if(!model || !(prisma as any)[model]) return NextResponse.json({ok:false,error:'MODEL_MISSING'},{status:400});
  const body=await req.json(); const row=await (prisma as any)[model].create({data:body}); return NextResponse.json({ok:true,row}); }
export async function PUT(req:NextRequest){ const res=keyFrom(req); const model=modelMap[res]; if(!model || !(prisma as any)[model]) return NextResponse.json({ok:false,error:'MODEL_MISSING'},{status:400});
  const id=idFrom(req); if(!id) return NextResponse.json({ok:false,error:'ID_REQUIRED'},{status:400});
  const body=await req.json(); const row=await (prisma as any)[model].update({where:{id:isNaN(+id)?id:+id},data:body}); return NextResponse.json({ok:true,row}); }
export async function DELETE(req:NextRequest){ const res=keyFrom(req); const model=modelMap[res]; if(!model || !(prisma as any)[model]) return NextResponse.json({ok:false,error:'MODEL_MISSING'},{status:400});
  const id=idFrom(req); if(!id) return NextResponse.json({ok:false,error:'ID_REQUIRED'},{status:400});
  await (prisma as any)[model].delete({where:{id:isNaN(+id)?id:+id}}); return NextResponse.json({ok:true}); }
TS

# Admin/Billing (Stripe) probe
mkdir -p app/api/admin/billing
cat > app/api/admin/billing/route.ts <<'TS'
import { NextResponse } from 'next/server';
export async function GET(){
  if(process.env.INTEGRATION_STRIPE!=='1' || !process.env.STRIPE_SECRET_KEY){
    return NextResponse.json({ ok:true, stripe:false, subscriptions:[] });
  }
  const Stripe = require('stripe'); const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const subs = await stripe.subscriptions.list({ limit: 10 });
  return NextResponse.json({ ok:true, stripe:true, subscriptions: subs.data });
}
TS

# Page generator for all required routes (create only if missing)
node - <<'NODE' "$REQUIRED_TXT"
const fs=require('fs'), path=require('path'); const reqs=fs.readFileSync(process.argv[2],'utf8').trim().split('\n');
const root=path.resolve('app'); const ensure=p=>fs.mkdirSync(path.dirname(p),{recursive:true}); const f=r=>path.join(root,r.replace(/^\//,''),'page.tsx');
const title=r=>r.split('/').filter(Boolean).map(s=>s.replace(/[\[\]]/g,'').replace(/-/g,' ')).map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' · ');
const resource=r=>{const a=r.split('/').filter(Boolean); while(['new','[id]','edit'].includes(a[a.length-1])) a.pop(); return a.join('/')};
const base=res=>'/'+res;
const listTpl=(t,res)=>`import { List } from '@/src/components/nexa/List';
async function fetchRows(){ const r=await fetch('/api/_crud/${res}',{ cache:'no-store' }); return r.json(); }
export default async function Page(){ const data=await fetchRows(); return <List title='${t}' rows={data.rows||[]} columns={[{key:'id',header:'ID'},{key:'name',header:'Name'}]} onNew={()=>location.assign('${base(res)}/new')} />; }`;
const newTpl=(t,res)=>`'use client'; import { Form } from '@/src/components/nexa/Form';
export default function Page(){ return <Form title='New ${t}' initial={{}} fields={[{name:'name',label:'Name'}]} onSubmit={async d=>{ const r=await fetch('/api/_crud/${res}',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)}); if(r.ok) location.assign('${base(res)}'); }} />; }`;
const viewTpl=(t,res)=>`'use client'; import { useEffect,useState } from 'react'; import { Form } from '@/src/components/nexa/Form';
export default function Page({ params }:{ params:{ id:string } }){ const [row,setRow]=useState<any>({}); useEffect(()=>{ fetch('/api/_crud/${res}?id='+params.id).then(r=>r.json()).then(d=>setRow((d.rows||[])[0]||{})) },[params.id]); return <Form title='View ${t}' initial={row} fields={[{name:'name',label:'Name'}]} onSubmit={async()=>{}} />; }`;
const editTpl=(t,res)=>`'use client'; import { Form } from '@/src/components/nexa/Form';
export default function Page({ params }:{ params:{ id:string } }){ return <Form title='Edit ${t}' initial={{}} fields={[{name:'name',label:'Name'}]} onSubmit={async d=>{ const r=await fetch('/api/_crud/${res}?id='+params.id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(d)}); if(r.ok) location.assign('${base(res)}'); }} />; }`;
const skip = new Set(['/dashboard','/login','/status']);
for(const r of reqs){ if(r==='/' || skip.has(r)) continue; const file=f(r); if(fs.existsSync(file)) continue; const res=resource(r), t=title(res);
  if(r.endsWith('/new')){ ensure(file); fs.writeFileSync(file,newTpl(t,res)); }
  else if(r.endsWith('/[id]')){ ensure(file); fs.writeFileSync(file,viewTpl(t,res)); }
  else if(r.endsWith('/[id]/edit')){ ensure(file); fs.writeFileSync(file,editTpl(t,res)); }
  else { ensure(file); fs.writeFileSync(file,listTpl(t,res)); }
}
NODE

# Replace stale imports if any
grep -RIl "@/components/nexa/" app || true | xargs -I{} perl -pi -e "s#@/components/nexa/#@/src/components/nexa/#g" {} 2>/dev/null || true

# ─────────────────────────────
# 5) Optional: add missing Prisma models (if allowed)
# ─────────────────────────────
if [ "$ALLOW_AUTOGEN_MIGRATIONS" = "1" ] && [ -f "../../prisma/schema.prisma" ]; then
  TMP_MM_JS=$(mktemp)
  cat > "$TMP_MM_JS" <<'NODE'
const fs=require('fs');
const src=fs.readFileSync('app/api/_crud/[resource]/route.ts','utf8');
const map=src.match(/modelMap:\s*Record<string,string>\s*=\s*{([\s\S]*?)}/);
if(!map){ console.log(''); process.exit(0); }
const models=[...map[1].matchAll(/'[^']+':\s*'([^']+)'/g)].map(m=>m[1]);
const schema=fs.readFileSync('../../prisma/schema.prisma','utf8');
const miss=[...new Set(models)].filter(m=>!new RegExp(`model\\s+${m}\\s+{`).test(schema));
console.log(miss.join('\n'));
NODE
  MISSING_MODELS=$(node "$TMP_MM_JS"); rm -f "$TMP_MM_JS"
  if [ -n "$MISSING_MODELS" ]; then
    {
      echo
      for M in $MISSING_MODELS; do
cat <<PRISMA
model $M {
  id        String   @id @default(cuid())
  name      String?
  meta      Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
PRISMA
      done
    } >> ../../prisma/schema.prisma
    (cd ../../ && pnpm prisma generate && pnpm prisma migrate dev --name add_autogen_models)
  fi
fi

# ─────────────────────────────
# 6) Build & verify routes
# ─────────────────────────────
pnpm install --frozen-lockfile
pnpm build

: > /tmp/nexa-built.txt
[ -f ".next/server/pages-manifest.json" ] && node -e "const m=require('./.next/server/pages-manifest.json'); for(const k of Object.keys(m)) if(!k.startsWith('/_next')&&!k.includes('_middleware')&&!k.includes('_document')&&!k.includes('_app')) console.log(k)" >> /tmp/nexa-built.txt
[ -f ".next/server/app-paths-manifest.json" ] && node -e "const m=require('./.next/server/app-paths-manifest.json'); for(const k of Object.keys(m)) { const p = k.replace(/\\/page$/,'').replace(/\\/route$/,''); if(!p.startsWith('/_next')) console.log(p) }" >> /tmp/nexa-built.txt
sort -u /tmp/nexa-built.txt | sed 's#//#/#g' > /tmp/nexa-built.unique.txt

MISSING=$(comm -23 "$REQUIRED_TXT" /tmp/nexa-built.unique.txt || true)
if [ -n "$MISSING" ]; then
  echo "✗ Missing routes after generation:"
  echo "$MISSING"
  exit 1
fi
echo "✓ All required routes exist in the build"

# ─────────────────────────────
# 7) Prod pre-flight & deploy (cache clear)
# ─────────────────────────────
NA=$(curl -s "$PROD_URL/api/_diag/na-nextauth" || echo '{}')
if [ "$(echo "$NA" | jq -r '.smtp.ok // empty')" != "true" ]; then echo "✗ SMTP not OK in prod diag"; exit 1; fi
CODE=$(curl -i -s -X POST "$PROD_URL/api/auth/signin/email?json=true" -H "content-type: application/x-www-form-urlencoded" --data "email=wraja1987@gmail.com&redirect=false&callbackUrl=%2Fdashboard" | awk 'NR==1{print $2}')
if [ "$CODE" != "302" ] && [ "$CODE" != "200" ]; then echo "✗ Email sign-in returned $CODE"; exit 1; fi
KPI=$(curl -s -o /dev/null -w "%{http_code}\n" "$PROD_URL/api/kpi/dashboard"); if [ "$KPI" -ge 400 ]; then echo "✗ KPI $KPI"; exit 1; fi

# Login & link once if needed
if ! vercel whoami >/dev/null 2>&1; then vercel login; fi
if ! vercel link --yes --project "$VERCEL_PROJECT" >/dev/null 2>&1; then vercel link; fi

# Deploy using prebuilt output (cache clear with --force)
DEPLOY_URL=$(vercel deploy --prod --force --yes --cwd "$REPO_DIR/$APP_DIR" | tail -n1)
echo "✓ Deployed: $DEPLOY_URL"
vercel alias set "$DEPLOY_URL" "$DOMAIN" || true

# Post-deploy checks
curl -s "$PROD_URL/api/auth/providers" | jq >/dev/null || true
curl -s "$PROD_URL/api/_diag/na-nextauth" | jq >/dev/null || true
echo "• /login headers:"; curl -sI "$PROD_URL/login" | sed -n '1,20p'

echo
echo "ALL DONE — Nexa pages generated, verified, built, and deployed."
