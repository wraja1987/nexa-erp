import type { NextApiRequest, NextApiResponse } from 'next';
import verifyCredentials from '../../../src/lib/auth-credentials';
import { Client } from 'pg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.method === 'POST' ? req.body || {} : req.query || {} as any;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'missing' });
    const user = await verifyCredentials(String(email), String(password));
    if (user) return res.status(200).json({ ok: true, user: { email: user.email, role: user.role, tenantId: user.tenantId } });
    // diag: check presence in DB
    const url = process.env.DATABASE_URL as string
    const c = new Client({ connectionString: url }); await c.connect();
    const tables = ['"User"','users','user']
    let found:any = null
    for (const t of tables) {
      try {
        const { rows } = await c.query(`select email, active, role, tenant_id, (password_hash is not null) has_hash from ${t} where lower(email)=lower($1) limit 1`, [email])
        if (rows && rows[0]) { found = { table: t, row: rows[0] }; break }
      } catch {}
    }
    await c.end();
    return res.status(200).json({ ok: false, user: null, found });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
