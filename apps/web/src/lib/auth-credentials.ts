import { Client } from "pg";
import bcrypt from "bcryptjs";

export type VerifiedUser = {
  id: string;
  email: string;
  role: string | null;
  tenantId: string | null;
};

const DBURL =
  process.env.DATABASE_URL ||
  (() => {
    const tryEnv = (p: string) => {
      try {
        return require("fs")
          .readFileSync(p, "utf8")
          .match(/^DATABASE_URL=(.+)$/m)?.[1]
          ?.trim();
      } catch {}
      return null;
    };
    return (
      tryEnv("apps/web/.env.local") ||
      tryEnv(".env.local") ||
      tryEnv("apps/web/.env") ||
      tryEnv(".env") ||
      ""
    );
  })();

async function findUserByEmail(client: Client, email: string) {
  const tables = ['"User"', "users", "user"];
  for (const t of tables) {
    try {
      const { rows } = await client.query(
        `select * from ${t} where lower(email)=lower($1) limit 1`,
        [email]
      );
      if (rows && rows[0]) return rows[0];
    } catch {}
  }
  return null;
}

export async function verifyCredentials(email?: string | null, password?: string | null) {
  if (!email || !password || !DBURL) return null;
  const client = new Client({ connectionString: DBURL });
  await client.connect();
  try {
    const row = await findUserByEmail(client, email);
    if (!row) return null;

    const hash = row.password_hash ?? row.passwordhash ?? row.password ?? row.pass_hash ?? null;
    const active = row.active ?? row.is_active ?? row.enabled;
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
