import { Client } from "pg";
async function main(){
  const db = new Client({ connectionString: process.env.DATABASE_URL! });
  await db.connect();

  // list tables in current schema
  const tables = await db.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = current_schema()
    ORDER BY table_name
  `);
  console.log("Tables:", tables.rows.map(r=>r.table_name));

  // find User row + id column
  const userCols = await db.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name='User'
  `);
  console.log('User columns:', userCols.rows.map(r=>r.column_name));

  // guess session table by name
  const candidates = ['Session','sessions','session','nextauth_session','next_auth_session'];
  let sessionTable: string | null = null;
  for(const t of candidates){
    const { rows } = await db.query(`SELECT to_regclass($1) as t`, [t.match(/[A-Z]/) ? `"${t}"` : t]);
    if (rows[0].t) { sessionTable = rows[0].t; break; }
  }
  console.log('Session table guess:', sessionTable || '(not found)');

  if (sessionTable){
    const q = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = split_part($1,'.',2)`, [sessionTable]);
    console.log('Session columns:', q.rows.map(r=>r.column_name));
  }

  await db.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
