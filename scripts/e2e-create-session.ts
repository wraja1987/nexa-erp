import { Client } from "pg";

function makeToken(prefix='sess'){
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}
function expiresInHours(h:number){
  return new Date(Date.now()+h*3600*1000).toISOString();
}

async function main(){
  const db = new Client({ connectionString: process.env.DATABASE_URL! });
  const email = process.env.NEXA_E2E_EMAIL!;
  await db.connect();

  const u = await db.query('SELECT id FROM "User" WHERE email=$1', [email]);
  if (u.rows.length===0) { throw new Error(`User not found: ${email}`); }
  const userId = u.rows[0].id;

  // find a session table
  const tableCandidates = ['"Session"','session','sessions','nextauth_session','next_auth_session'];
  let sessionTable:string|undefined;
  for(const t of tableCandidates){
    const r = await db.query('SELECT to_regclass($1) as t', [t]);
    if (r.rows[0].t) { sessionTable = r.rows[0].t; break; }
  }
  if (!sessionTable) throw new Error('No session table found. Expected one of Session/session/sessions/nextauth_session.');

  // read its columns
  const colsRes = await db.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = split_part($1,'.',2)
  `, [sessionTable]);
  const cols = new Set(colsRes.rows.map(r=>r.column_name));

  // best-guess column names
  const userCol = cols.has('userId') ? 'userId' : (cols.has('user_id') ? 'user_id' : null);
  const tokenCol = cols.has('session_token') ? 'session_token' : (cols.has('token') ? 'token' : null);
  const expiresCol = cols.has('expires') ? 'expires' : null;
  if(!userCol || !tokenCol || !expiresCol) {
    throw new Error(`Session table ${sessionTable} missing one of userId/user_id, session_token/token, expires`);
  }

  // insert
  const token = makeToken('nextauth');
  const expISO = expiresInHours(8); // 8h
  const sql = `INSERT INTO ${sessionTable}("${tokenCol}","${userCol}","${expiresCol}") VALUES($1,$2,$3)`;
  await db.query(sql, [token, userId, expISO]);

  console.log(JSON.stringify({ sessionTable, userId, token, expires: expISO }, null, 2));
  await db.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
