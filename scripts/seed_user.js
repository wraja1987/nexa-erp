const fs=require('fs');const path=require('path');
const {Client}=require('pg');const bcrypt=require('bcryptjs');

function dburl(){
  const files=['apps/web/.env.local','apps/web/.env.production.local','.env.local','.env'];
  for(const f of files){
    try{
      const t=fs.readFileSync(path.join(process.cwd(),f),'utf8');
      const m=t.match(/^DATABASE_URL=(.+)$/m);
      if(m) return m[1].trim();
    }catch{}
  }
  return process.env.DATABASE_URL||'';
}

(async()=>{
  const url=dburl(); if(!url){ console.error('NO DATABASE_URL'); process.exit(2); }
  const c=new Client({connectionString:url}); await c.connect();
  const email='info@nexaai.co.uk'; const pass='NexaSuper!123';

  await c.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS password_hash text');
  try{ await c.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS active boolean DEFAULT true'); }catch{}
  try{ await c.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS role text'); }catch{}
  try{ await c.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS tenant_id text'); }catch{}

  const hash=await bcrypt.hash(pass,10);
  await c.query(`UPDATE "User"
                 SET password_hash=$1,
                     active=COALESCE(active,true),
                     role=COALESCE(role,'SUPER_ADMIN'),
                     tenant_id=COALESCE(tenant_id,'00000000-0000-0000-0000-000000000000')
                 WHERE lower(email)=lower($2)`,[hash,email]);

  const {rows}=await c.query(`SELECT email,active,role,tenant_id,(password_hash IS NOT NULL) has_hash
                              FROM "User" WHERE lower(email)=lower($1)`,[email]);
  console.log('User:', rows[0]||null);
  await c.end();
})().catch(e=>{console.error(e);process.exit(9)});
