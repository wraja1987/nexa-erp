import { Client } from "pg";
import bcrypt from "bcryptjs";

type Row = Record<string, any>;
type VerifiedUser = { id: string; email: string; role?: string | null; tenantId?: string | null };

const DBURL = process.env.DATABASE_URL;

async function findUserByEmail(c: Client, email: string): Promise<Row | null> {
  const tables = [`"User"`, "users", "user"];
  for (const t of tables) {
    try {
      const { rows } = await c.query(`select * from ${t} where lower(email)=lower($1) limit 1`, [email]);
      if (rows && rows[0]) return rows[0];
    } catch { /* table might not exist; keep trying */ }
  }
  return null;
}

export async function verifyCredentials(email?: string | null, password?: string | null): Promise<VerifiedUser | null> {
  if (!email || !password || !DBURL) return null;
  const client = new Client({ connectionString: DBURL });
  await client.connect();
  try {
    const row = await findUserByEmail(client, email);
    if (!row) return null;

    const hash = row.password_hash ?? row.passwordhash ?? row.password ?? row.pass_hash ?? null;
    const active = (row.active ?? row.is_active ?? row.enabled);
    if (active === false) return null;
    if (!hash) return null;

    const ok = await bcrypt.compare(password, String(hash));
    if (!ok) return null;

    return {
      id: String(row.id),
      email: String(row.email).toLowerCase(),
      role: (row.role ?? row.user_role ?? null) as string | null,
      tenantId: (row.tenant_id ?? row.tenantid ?? row.tenant ?? null) as string | null,
    };
  } finally {
    await client.end();
  }
}

export default verifyCredentials;
