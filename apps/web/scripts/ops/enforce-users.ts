// apps/web/scripts/ops/enforce-users.ts
import 'dotenv/config';
import { Client } from 'pg';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const USERS = [
  { email: 'info@nexaai.co.uk', role: 'super_admin', password: 'Wolfish123' },
  { email: 'wraja1987@gmail.com', role: 'admin',        password: 'Wolfish123' },
];

type Cols = {
  email: string;
  passwordHash?: string;
  role?: string;
  mfaEnforced?: string;
  isActive?: string;
  mustChangePassword?: string;
  id?: string;
  idHasDefault?: boolean;
};

async function findTableAndCols(client: Client) {
  // Prefer "User", then "users"
  const tableCandidates = ['"User"', 'users'];
  let table = '';
  let cols: Cols = { email: '' };

  for (const t of tableCandidates) {
    const res = await client.query(`
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${t === '"User"' ? `'User'` : `'users'`};
    `);
    if (res.rowCount && res.rows.length) {
      table = t;
      const names = res.rows.map((r: any) => r.column_name);
      const pick = (options: string[]) => options.find(o => names.includes(o));
      cols.email = pick(['email'])!;
      cols.passwordHash = pick(['passwordHash','password_hash']);
      cols.role = pick(['role']);
      cols.mfaEnforced = pick(['mfaEnforced','mfa_enforced']);
      cols.isActive = pick(['isActive','is_active']);
      cols.mustChangePassword = pick(['mustChangePassword','must_change_password']);
      if (names.includes('id')) {
        cols.id = 'id';
        const idRow = res.rows.find((r: any) => r.column_name === 'id');
        cols.idHasDefault = !!(idRow && idRow.column_default);
      }
      return { table, cols };
    }
  }
  throw new Error('Could not find "User" or "users" table in public schema.');
}

async function upsertUser(client: Client, table: string, cols: Cols, email: string, role: string, plain: string) {
  const hash = await bcrypt.hash(plain, 12);

  // Build dynamic sets based on available columns
  const sets: string[] = [];
  const vals: any[] = [email];
  let i = 2;

  if (cols.passwordHash) { sets.push(`"${cols.passwordHash}" = $${i++}`); vals.push(hash); }
  if (cols.role)         { sets.push(`"${cols.role}" = $${i++}`);         vals.push(role); }
  if (cols.mfaEnforced)  { sets.push(`"${cols.mfaEnforced}" = $${i++}`);  vals.push(true); }
  if (cols.isActive)     { sets.push(`"${cols.isActive}" = $${i++}`);     vals.push(true); }
  if (cols.mustChangePassword) { sets.push(`"${cols.mustChangePassword}" = $${i++}`); vals.push(false); }

  const insertCols = [`"${cols.email}"`];
  const insertVals = ['$1'];
  const insertParams: any[] = [email];
  let j = 2;

  if (cols.id && !cols.idHasDefault) { insertCols.unshift('"id"'); insertVals.unshift(`$${j++}`); insertParams.unshift(randomUUID()); }
  if (cols.passwordHash) { insertCols.push(`"${cols.passwordHash}"`); insertVals.push(`$${j++}`); insertParams.push(hash); }
  if (cols.role)         { insertCols.push(`"${cols.role}"`);         insertVals.push(`$${j++}`); insertParams.push(role); }
  if (cols.mfaEnforced)  { insertCols.push(`"${cols.mfaEnforced}"`);  insertVals.push(`$${j++}`); insertParams.push(true); }
  if (cols.isActive)     { insertCols.push(`"${cols.isActive}"`);     insertVals.push(`$${j++}`); insertParams.push(true); }
  if (cols.mustChangePassword) { insertCols.push(`"${cols.mustChangePassword}"`); insertVals.push(`$${j++}`); insertParams.push(false); }

  const sql = `
    INSERT INTO ${table} (${insertCols.join(', ')})
    VALUES (${insertVals.join(', ')})
    ON CONFLICT ("${cols.email}") ${sets.length ? `DO UPDATE SET ${sets.join(', ')}` : 'DO NOTHING'};
  `;

  await client.query(sql, insertParams.length ? insertParams : [email]);
}

(async () => {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) throw new Error('Missing DATABASE_URL in env');

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const { table, cols } = await findTableAndCols(client);
  console.log('Users table:', table, 'Columns used:', cols);

  for (const u of USERS) {
    await upsertUser(client, table, cols, u.email, u.role, u.password);
    console.log(`Upserted ${u.email} as ${u.role} with MFA enforced.`);
  }

  await client.end();
  console.log('DONE: users enforced.');
})();
