import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import { Client } from 'pg'

function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), 'apps/web/.env.production.local'),
    path.resolve(process.cwd(), '.env.production.local'),
    path.resolve(process.cwd(), 'apps/web/.env.local'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'apps/web/.env'),
    path.resolve(process.cwd(), '.env'),
  ]
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const t = fs.readFileSync(p, 'utf8')
      const m = t.match(/^DATABASE_URL=(.+)$/m)
      if (m) process.env.DATABASE_URL = m[1].trim().replace(/^"|"$/g, '')
    }
  }
}

async function upsert() {
  loadEnv()
  const url = process.env.DATABASE_URL!
  const c = new Client({ connectionString: url })
  await c.connect()
  const email = 'sayeedr222@gmail.com'
  const role = 'ADMIN'
  const tenant = '00000000-0000-0000-0000-000000000001'
  const hash = await bcrypt.hash('Wolfish123', 10)

  // Detect columns on "User"
  const { rows: cols } = await c.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='User'")
  const has = (n:string)=> cols.some(r=>r.column_name===n)
  const setParts = [ 'role=$2', 'active=true', 'password_hash=$3' ]
  if (has('tenant_id')) setParts.push('tenant_id=$4')
  if (has('updated_at')) setParts.push('updated_at=now()')
  if (has('updatedAt')) setParts.push('"updatedAt"=now()')

  await c.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS password_hash text')
  const upSql = `INSERT INTO "User"(id,email,role,active,password_hash${has('tenant_id')?',tenant_id':''}${has('created_at')?',created_at':''}${has('createdAt')?',"createdAt"':''}${has('updated_at')?',updated_at':''}${has('updatedAt')?',"updatedAt"':''})
                VALUES(gen_random_uuid(),$1,$2,true,$3${has('tenant_id')?',$4':''}${has('created_at')?',now()':''}${has('createdAt')?',now()':''}${has('updated_at')?',now()':''}${has('updatedAt')?',now()':''})
                ON CONFLICT (email) DO UPDATE SET ${setParts.join(', ')}`
  await c.query(upSql,[email,role,hash,tenant])

  // Mirror to public.users if present
  const usersCols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='users'").then(r=>r.rows).catch(()=>[] as any[])
  if (usersCols.length) {
    await c.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash text')
    await c.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password text')
    await c.query('UPDATE public.users SET password_hash=$1, password=$1, active=true, role=$2, tenant_id=$3 WHERE lower(email)=lower($4)', [hash, role, tenant, email])
  }
  await c.end()
  console.log('[upsertUserRaw] Upserted', email)
}

upsert().catch((e)=>{ console.error(e); process.exit(1) })


