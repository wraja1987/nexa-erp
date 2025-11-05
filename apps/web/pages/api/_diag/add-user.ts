import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { key, email, password, role = 'ADMIN', tenantId } = req.body || {}
    if (!key || key !== (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)) return res.status(401).json({ ok: false })
    if (!email || !password) return res.status(400).json({ ok: false })
    const c = new Client({ connectionString: process.env.DATABASE_URL })
    await c.connect()
    const cols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='User'").then(r=>r.rows)
    const has = (n:string)=> cols.some((r:any)=>r.column_name===n)
    const hash = await bcrypt.hash(String(password), 10)
    const setParts = [ 'role=$2', 'active=true', 'password_hash=$3' ]
    if (has('tenant_id')) setParts.push('tenant_id=$4')
    if (has('updated_at')) setParts.push('updated_at=now()')
    if (has('updatedAt')) setParts.push('"updatedAt"=now()')
    await c.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS password_hash text')
    const upSql = `INSERT INTO "User"(id,email,role,active,password_hash${has('tenant_id')?',tenant_id':''}${has('created_at')?',created_at':''}${has('createdAt')?',"createdAt"':''}${has('updated_at')?',updated_at':''}${has('updatedAt')?',"updatedAt"':''})
                  VALUES(gen_random_uuid(),$1,$2,true,$3${has('tenant_id')?',$4':''}${has('created_at')?',now()':''}${has('createdAt')?',now()':''}${has('updated_at')?',now()':''}${has('updatedAt')?',now()':''})
                  ON CONFLICT (email) DO UPDATE SET ${setParts.join(', ')}`
    await c.query(upSql, [email, String(role).toUpperCase(), hash, tenantId || '00000000-0000-0000-0000-000000000001'])
    await c.end()
    return res.status(200).json({ ok: true })
  } catch (e:any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) })
  }
}


