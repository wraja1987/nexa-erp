import { PrismaClient } from "@prisma/client";
import fs from "fs"; import path from "path";
const prisma = new PrismaClient();

async function tableExists(name: string) {
  try {
    const [row]: any = await prisma.$queryRawUnsafe(
      `SELECT to_regclass('public."${name}"') IS NOT NULL as exists;`
    );
    return !!(row?.exists === true || row?.exists === "t");
  } catch { return false; }
}

async function upsertConfig(key: string, value: string) {
  if (await tableExists("FeatureFlag")) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "FeatureFlag" ("key","value","description")
       VALUES ($1,$2,$3)
       ON CONFLICT ("key") DO UPDATE SET "value"=EXCLUDED."value","description"=EXCLUDED."description";`,
      key, value, "Disabled by baseline decision"
    ); return "FeatureFlag";
  }
  if (await tableExists("Setting")) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Setting" ("key","value")
       VALUES ($1,$2)
       ON CONFLICT ("key") DO UPDATE SET "value"=EXCLUDED."value";`,
      key, value
    ); return "Setting";
  }
  if (await tableExists("KeyValue")) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "KeyValue" ("k","v")
       VALUES ($1,$2)
       ON CONFLICT ("k") DO UPDATE SET "v"=EXCLUDED."v";`,
      key, value
    ); return "KeyValue";
  }
  return null;
}

async function ensureDemoTenantAndUser() {
  let demoHandled = false, userHandled = false;
  try {
    if (await tableExists("Tenant")) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Tenant" ("slug","name")
         VALUES ($1,$2)
         ON CONFLICT ("slug") DO UPDATE SET "name"=EXCLUDED."name";`,
        "demo", "Nexa Demo"
      );
      demoHandled = true;
    }
    if (await tableExists("User")) {
      // generic upsert by email; works for passwordless/SSO or existing auth
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" ("email","name","role","active")
         VALUES ($1,$2,COALESCE($3,(SELECT "role" FROM "User" WHERE "email"=$1 LIMIT 1)),true)
         ON CONFLICT ("email") DO UPDATE SET "name"=EXCLUDED."name","active"=true;`,
        "nexaaierp@gmail.com","Nexa Demo Admin","owner"
      );
      userHandled = true;
    }
  } catch {}
  return { demoHandled, userHandled };
}

async function syncModulesFromJSON() {
  const hasModule = await tableExists("Module");
  const hasSub = await tableExists("SubModule");
  if (!hasModule) return { synced: false, reason: "No Module table" };

  const candidates = [
    path.join(process.cwd(),"apps","web","public","modules.json"),
    path.join(process.cwd(),"apps","web","modules.json"),
    path.join(process.cwd(),"public","modules.json"),
  ];
  const file = candidates.find(f => fs.existsSync(f));
  if (!file) return { synced: false, reason: "modules.json not found" };

  const data = JSON.parse(fs.readFileSync(file,"utf8")) as {
    modules: Array<{ slug:string; label:string; subs?: Array<{ slug:string; label:string }> }>
  };

  for (const m of data.modules) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Module" ("slug","label")
       VALUES ($1,$2)
       ON CONFLICT ("slug") DO UPDATE SET "label"=EXCLUDED."label";`,
      m.slug, m.label
    );
    if (hasSub && m.subs?.length) {
      for (const s of m.subs) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "SubModule" ("slug","label","moduleId")
           SELECT $1,$2,"id" FROM "Module" WHERE "slug"=$3
           ON CONFLICT ("slug","moduleId") DO UPDATE SET "label"=EXCLUDED."label";`,
          s.slug, s.label, m.slug
        );
      }
    }
  }
  return { synced: true, reason: null };
}

async function disableDecidedItems() {
  const back = await upsertConfig("hubspot_enabled","false")
           || await upsertConfig("marketplace_enabled","false")
           || await upsertConfig("twilio_sms_enabled","false");
  return back; // returns the table name used, or null
}

async function main() {
  const results:any = {};
  results.demo = await ensureDemoTenantAndUser();
  results.flagsTable = await disableDecidedItems();
  results.modules = await syncModulesFromJSON();
  console.log(JSON.stringify({ ok:true, results }, null, 2));
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
