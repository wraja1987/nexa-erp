import { Client } from "pg";
import bcrypt from "bcryptjs";

function id(prefix:string){return `${prefix}_${Math.random().toString(36).slice(2,10)}${Date.now().toString(36)}`}

async function getCols(db:Client, table:string){
  const { rows } = await db.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name=$1 AND table_schema = current_schema()`, [table]);
  return new Set(rows.map(r => r.column_name));
}

async function upsertUser(db:Client, email:string, password:string, displayName:string){
  const cols = await getCols(db, "User");
  const has = (c:string)=>cols.has(c);

  const passCol = has("password_hash") ? "password_hash"
               : has("hashed_password") ? "hashed_password"
               : has("password") ? "password" : null;
  if(!passCol) throw new Error('No password column found (tried password_hash, hashed_password, password)');

  const nameCol = has("name") ? "name" : (has("full_name") ? "full_name" : null);

  const existing = await db.query('SELECT id FROM "User" WHERE email=$1', [email]);
  const hashed = await bcrypt.hash(password, 10);

  if(existing.rows.length === 0){
    const userId = has("id") ? id("u") : null;
    const fields:string[] = [];
    const params:any[] = [];
    let i=1;

    if(userId){ fields.push("id"); params.push(userId); }
    fields.push("email"); params.push(email);
    if(nameCol){ fields.push(nameCol); params.push(displayName); }
    fields.push(passCol); params.push(hashed);

    const colsSQL = fields.map(f => `"${f}"`).join(",");
    const valsSQL = params.map((_,idx)=>`$${idx+1}`).join(",");

    await db.query(`INSERT INTO "User"(${colsSQL}) VALUES(${valsSQL})`, params);
    console.log("Inserted:", email);
  } else {
    const sets:string[] = [`"${passCol}"=$1`];
    const params:any[] = [hashed, email];
    if(nameCol){ sets.unshift(`"${nameCol}"=$3`); params.push(displayName); params.splice(1,0, /*keep email last*/ ); }
    // rebuild cleanly:
    params.length=0;
    if(nameCol){ sets.length=0; sets.push(`"${nameCol}"=$1`, `"${passCol}"=$2`); params.push(displayName, hashed, email); }
    else { sets.length=0; sets.push(`"${passCol}"=$1`); params.push(hashed, email); }

    await db.query(`UPDATE "User" SET ${sets.join(", ")} WHERE email=$${params.length}`, params);
    console.log("Updated:", email);
  }
}

async function main(){
  const db = new Client({ connectionString: process.env.DATABASE_URL! });
  await db.connect();
  await upsertUser(db, process.env.NEXA_SUPER_EMAIL!, process.env.NEXA_SUPER_PASSWORD!, "Super Admin");
  await upsertUser(db, process.env.NEXA_ADMIN_EMAIL!, process.env.NEXA_ADMIN_PASSWORD!, "Admin");
  await db.end();
  console.log("SQL seeding complete.");
}
main().catch(e=>{console.error(e);process.exit(1)});
