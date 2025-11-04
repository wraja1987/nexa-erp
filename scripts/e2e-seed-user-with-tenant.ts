import { Client } from "pg";
import bcrypt from "bcryptjs";

function id(prefix:string){return `${prefix}_${Math.random().toString(36).slice(2,10)}${Date.now().toString(36)}`;}

async function ensureTenant(db:Client){
  let t = await db.query('SELECT id FROM "Tenant" LIMIT 1');
  if (t.rows.length === 0) {
    try { t = await db.query('INSERT INTO "Tenant"(name) VALUES($1) RETURNING id', ['Default Tenant']); }
    catch { t = await db.query('INSERT INTO "Tenant" DEFAULT VALUES RETURNING id'); }
    console.log("Created tenant:", t.rows[0].id);
  }
  return t.rows[0].id as string;
}

async function getCols(db:Client, table:string){
  const { rows } = await db.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name=$1
  `,[table]);
  return new Set(rows.map(r=>r.column_name));
}

async function upsertUser(db:Client, email:string, password:string, roleValue:string, tenantId:string){
  const cols = await getCols(db, "User");
  if(!cols.has("email") || !cols.has("passwordHash") || !cols.has("tenant_id") || !cols.has("role")){
    throw new Error('Table "User" must include: email, "passwordHash", tenant_id, role');
  }

  const hashed = await bcrypt.hash(password, 10);
  const found = await db.query('SELECT id FROM "User" WHERE email=$1', [email]);

  if(found.rows.length === 0){
    const fields:string[] = [];
    const params:any[] = [];

    if (cols.has("id")) { fields.push('"id"'); params.push(id("u")); }
    fields.push('"tenant_id"'); params.push(tenantId);
    fields.push('"email"'); params.push(email);
    fields.push('"role"'); params.push(roleValue);
    fields.push('"passwordHash"'); params.push(hashed);

    if (cols.has("active")) { fields.push('"active"'); params.push(true); }
    if (cols.has("createdAt")) { fields.push('"createdAt"'); params.push(new Date()); }
    if (cols.has("updatedAt")) { fields.push('"updatedAt"'); params.push(new Date()); }

    const placeholders = params.map((_,i)=>"$"+(i+1)).join(",");
    await db.query(`INSERT INTO "User"(${fields.join(",")}) VALUES(${placeholders})`, params);
    console.log("Inserted:", email, "tenant:", tenantId, "role:", roleValue);
  } else {
    const setParts:string[] = [];
    const params:any[] = [];

    setParts.push('"tenant_id"=$1'); params.push(tenantId);
    setParts.push('"role"=$2'); params.push(roleValue);
    setParts.push('"passwordHash"=$3'); params.push(hashed);
    let idx = 3;

    if (cols.has("active")) { setParts.push(`"active"=$${++idx}`); params.push(true); }
    if (cols.has("updatedAt")) { setParts.push(`"updatedAt"=$${++idx}`); params.push(new Date()); }

    params.push(email);
    await db.query(`UPDATE "User" SET ${setParts.join(", ")} WHERE email=$${++idx}`, params);
    console.log("Updated:", email, "tenant:", tenantId, "role:", roleValue);
  }
}

async function main(){
  const db = new Client({ connectionString: process.env.DATABASE_URL! });
  await db.connect();
  const tenantId = await ensureTenant(db);
  await upsertUser(db, process.env.NEXA_SUPER_EMAIL!, process.env.NEXA_SUPER_PASSWORD!, "SUPER_ADMIN", tenantId);
  await upsertUser(db, process.env.NEXA_ADMIN_EMAIL!, process.env.NEXA_ADMIN_PASSWORD!, "ADMIN", tenantId);
  await db.end();
  console.log('Seed complete (tenant + users with "passwordHash" + role).');
}
main().catch(e=>{console.error(e);process.exit(1)});
