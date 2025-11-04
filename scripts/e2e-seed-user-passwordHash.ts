import { Client } from "pg";
import bcrypt from "bcryptjs";

function id(prefix:string){return `${prefix}_${Math.random().toString(36).slice(2,10)}${Date.now().toString(36)}`}

async function upsertUser(db:Client, email:string, password:string){
  // Check the exact columns available
  const cols = new Set((await db.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name='User'
  `)).rows.map(r=>r.column_name));

  if(!cols.has("email") || !cols.has("passwordHash")){
    throw new Error('Table "User" must have email and "passwordHash" columns');
  }

  const hashed = await bcrypt.hash(password, 10);
  const found = await db.query('SELECT id FROM "User" WHERE email=$1', [email]);

  if(found.rows.length === 0){
    // Insert only the safe, existing columns
    // id (if present), email, "passwordHash"; others have defaults/nulls
    const hasId = cols.has("id");
    const fields = [];
    const params:any[] = [];
    if(hasId){ fields.push('"id"'); params.push(id("u")); }
    fields.push('"email"'); params.push(email);
    fields.push('"passwordHash"'); params.push(hashed);

    await db.query(`INSERT INTO "User"(${fields.join(",")}) VALUES(${params.map((_,i)=>"$"+(i+1)).join(",")})`, params);
    console.log("Inserted:", email);
  } else {
    await db.query('UPDATE "User" SET "passwordHash"=$1 WHERE email=$2', [hashed, email]);
    console.log("Updated passwordHash:", email);
  }
}

async function main(){
  const db = new Client({ connectionString: process.env.DATABASE_URL! });
  await db.connect();
  await upsertUser(db, process.env.NEXA_SUPER_EMAIL!, process.env.NEXA_SUPER_PASSWORD!);
  await upsertUser(db, process.env.NEXA_ADMIN_EMAIL!, process.env.NEXA_ADMIN_PASSWORD!);
  await db.end();
  console.log('Seed complete (using "passwordHash").');
}
main().catch(e=>{console.error(e);process.exit(1)});
