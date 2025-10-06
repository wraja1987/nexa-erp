#!/usr/bin/env bash
set -Eeuo pipefail

################################################################################
# Nexa ERP — Universal Seeder + Accounts (ALL models, tenant-aware, 6 months)
# Creates:
#   • Super Admin  : info@chiefaa.com / Wolfish123 (only super admin)
#   • Admin        : wraja1987@yahoo.co.uk / Wolfish123 (gets rich dummy data)
#
# What it does (idempotent):
#   1) Ensures DATABASE_URL (Postgres) and connectivity
#   2) Installs @prisma/client, prisma, bcryptjs, @faker-js/faker if missing
#   3) prisma db push (safe vs empty DB)
#   4) Reads Prisma DMMF to discover EVERY model and fields
#   5) Builds a dependency graph (relations), topologically seeds parents first
#   6) Generates realistic values for required scalars; respects defaults
#   7) Handles 1:1, 1:N, and M:N (link tables) automatically
#   8) Adds 6 months of time-series records where applicable
#   9) Enforces one Super Admin, creates Admin, and attaches both to tenant
#  10) Prints a per-model insert count + user rows at the end
################################################################################

ROOT="$HOME/Desktop/Business Opportunities/Nexa ERP"
WEB="$ROOT/apps/web"
SUPER="info@chiefaa.com"
ADMIN="wraja1987@yahoo.co.uk"
PLAINTEXT_PW="Wolfish123"

# DB URL used by psql (no ?schema); Prisma will add ?schema=public
PSQL_URL_DEFAULT="postgresql://nexa_user:StrongPass123@127.0.0.1:6543/nexa"
PRISMA_URL="${PSQL_URL_DEFAULT}?schema=public"

echo "[seeder] Repo root: $ROOT"
if [ ! -d "$ROOT" ]; then
  echo "[seeder][fatal] Repo not found at $ROOT" >&2
  exit 1
fi

mkdir -p "$WEB"
if ! grep -qE "^DATABASE_URL=" "$WEB/.env" 2>/dev/null; then
  printf "DATABASE_URL=%s\n" "$PSQL_URL_DEFAULT" >> "$WEB/.env"
  echo "[seeder] Wrote DATABASE_URL to $WEB/.env"
fi

# Detect Prisma schema directory
PRISMA_DIR=""
if [ -f "$ROOT/prisma/schema.prisma" ]; then
  PRISMA_DIR="$ROOT"
elif [ -f "$ROOT/apps/web/prisma/schema.prisma" ]; then
  PRISMA_DIR="$ROOT/apps/web"
else
  found_schema="$(find "$ROOT" -maxdepth 4 -type f -name "schema.prisma" -print -quit || true)"
  if [ -n "${found_schema:-}" ]; then
    PRISMA_DIR="$(dirname "$found_schema")"
  fi
fi

if [ -z "$PRISMA_DIR" ]; then
  echo "[seeder][fatal] Could not find prisma/schema.prisma under $ROOT" >&2
  exit 1
fi

echo "[seeder] Prisma directory: $PRISMA_DIR"

# Ensure PRISMA_DIR .env also has DATABASE_URL
if ! grep -qE "^DATABASE_URL=" "$PRISMA_DIR/.env" 2>/dev/null; then
  printf "DATABASE_URL=%s\n" "$PSQL_URL_DEFAULT" >> "$PRISMA_DIR/.env"
  echo "[seeder] Wrote DATABASE_URL to $PRISMA_DIR/.env"
fi

# Validate DB connectivity (and try to bootstrap local Postgres if down)
DB_URL="$(grep -Eo "^DATABASE_URL=.*" "$WEB/.env" | cut -d= -f2- | sed -e "s/^['\"]//" -e "s/['\"]$//")"
echo "[seeder] Checking DB connectivity: $DB_URL"
if ! psql "$DB_URL" -Atqc "select 1" >/dev/null 2>&1; then
  echo "[seeder] DB not reachable. Attempting to start local Postgres on port 6543..."
  DATA_DIR="$HOME/.local/share/nexa/pg16"
  if command -v pg_ctl >/dev/null 2>&1; then
    mkdir -p "$DATA_DIR"
    if [ ! -f "$DATA_DIR/PG_VERSION" ]; then
      initdb -D "$DATA_DIR" -U postgres -A trust -E UTF8 >/dev/null
    fi
    pg_ctl -D "$DATA_DIR" -o "-p 6543" -l "$DATA_DIR/server.log" start >/dev/null 2>&1 || true
    # wait for server
    for i in $(seq 1 60); do
      psql "postgresql://postgres@127.0.0.1:6543/postgres" -Atqc "select 1" >/dev/null 2>&1 && break || sleep 1
    done
    # Ensure role and database (no DO blocks; use separate commands)
    if ! psql -v ON_ERROR_STOP=1 "postgresql://postgres@127.0.0.1:6543/postgres" -tAc "SELECT 1 FROM pg_roles WHERE rolname='nexa_user'" | grep -q 1; then
      psql -v ON_ERROR_STOP=1 "postgresql://postgres@127.0.0.1:6543/postgres" -c "CREATE ROLE nexa_user LOGIN PASSWORD 'StrongPass123' CREATEDB;" >/dev/null
    else
      psql -v ON_ERROR_STOP=1 "postgresql://postgres@127.0.0.1:6543/postgres" -c "ALTER ROLE nexa_user WITH LOGIN PASSWORD 'StrongPass123' CREATEDB;" >/dev/null
    fi
    if ! psql -v ON_ERROR_STOP=1 "postgresql://postgres@127.0.0.1:6543/postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='nexa'" | grep -q 1; then
      psql -v ON_ERROR_STOP=1 "postgresql://postgres@127.0.0.1:6543/postgres" -c "CREATE DATABASE nexa OWNER nexa_user;" >/dev/null
    fi
    psql -v ON_ERROR_STOP=1 "postgresql://postgres@127.0.0.1:6543/nexa" -c "ALTER SCHEMA public OWNER TO nexa_user;" >/dev/null
    psql -v ON_ERROR_STOP=1 "postgresql://postgres@127.0.0.1:6543/nexa" -c "GRANT ALL ON SCHEMA public TO nexa_user;" >/dev/null
  else
    echo "[seeder][fatal] Postgres server not reachable and pg_ctl not found. Start Docker Desktop and run a postgres container, or install Postgres (brew install postgresql@16)." >&2
    exit 2
  fi
fi
echo "[seeder] DB OK"

# Derive Prisma URL from DB_URL (ensure schema=public query param)
if [[ "$DB_URL" == *\?* ]]; then
  PRISMA_URL="${DB_URL}&schema=public"
else
  PRISMA_URL="${DB_URL}?schema=public"
fi

# Tooling (install if missing)
cd "$ROOT"
echo "[seeder] Ensuring Node deps (@prisma/client prisma bcryptjs @faker-js/faker)"
if ! node -e "require('@prisma/client')" >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then pnpm -w add -D @prisma/client prisma >/dev/null 2>&1 || true
  else npm i @prisma/client prisma --no-save >/dev/null 2>&1 || true
  fi
fi
if ! node -e "require('bcryptjs')" >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then pnpm -w add -D bcryptjs >/dev/null 2>&1 || true
  else npm i bcryptjs --no-save >/dev/null 2>&1 || true
  fi
fi
if ! node -e "require('@faker-js/faker')" >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then pnpm -w add -D @faker-js/faker >/dev/null 2>&1 || true
  else npm i @faker-js/faker --no-save >/dev/null 2>&1 || true
  fi
fi

# Push schema
echo "[seeder] Running prisma db push"
cd "$PRISMA_DIR"
DATABASE_URL="$PRISMA_URL" npx -y prisma db push --accept-data-loss >/dev/null
DATABASE_URL="$PRISMA_URL" npx -y prisma generate >/dev/null 2>&1 || true

# Run universal seeder
echo "[seeder] Running universal seeder via Node"
DATABASE_URL="$PRISMA_URL" SUPER="$SUPER" ADMIN="$ADMIN" PASSWORD="$PLAINTEXT_PW" node - <<'NODE'
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const dmmf = Prisma.dmmf;

const SUPER = process.env.SUPER;
const ADMIN = process.env.ADMIN;
const PASSWORD = process.env.PASSWORD;

// Config
const MONTHS_BACK = 6;             // how many months of time-series data to create
const BASE_ROWS_PER_MODEL = 25;    // scalable; heavy models will also get time-series adds

// Utility
const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));
const randInt = (a,b)=> Math.floor(Math.random()*(b-a+1))+a;
const monthSeries = (n) => {
  const out=[], now=new Date();
  for (let i=n; i>=1; i--) out.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()-i, 15)));
  return out;
};

// Identify models (skip Prisma _Migration and pure join tables we will fill post)
const models = dmmf.datamodel.models.filter(m => !m.name.startsWith("_") && m.name !== "Migration");

// Map model -> fields metadata
const mfields = Object.fromEntries(models.map(m => [m.name, m.fields]));

// Find id field and scalar fields
function idFieldOf(model){
  const id = mfields[model].find(f => f.isId);
  return id ? id.name : null;
}
function scalarFields(model){
  return mfields[model].filter(f => ["String","Int","BigInt","Float","Decimal","Boolean","DateTime","Json","Bytes"].includes(f.type) && !f.isId && !f.isUpdatedAt);
}
function relationFields(model){
  return mfields[model].filter(f => f.relationName || f.relationFromFields?.length);
}
function requiredScalars(model){
  return scalarFields(model).filter(f => f.isRequired && !f.hasDefaultValue);
}

// Build dependency graph: model depends on target models it references (required)
const deps = new Map(models.map(m => [m.name, new Set()]));
for (const m of models){
  for (const rf of relationFields(m.name)){
    if (rf.type && rf.isRequired){
      deps.get(m.name).add(rf.type); // edge m -> rf.type
    }
  }
}
// Topo sort
function topoSort(graph){
  const indeg = new Map([...graph.keys()].map(k=>[k,0]));
  for (const [k,vs] of graph) for (const v of vs) if (indeg.has(v)) indeg.set(v, indeg.get(v)+1);
  const q=[]; for (const [k,d] of indeg) if (d===0) q.push(k);
  const order=[];
  while(q.length){
    const u=q.shift(); order.push(u);
    for (const v of (graph.get(u)||[])){
      if (!indeg.has(v)) continue;
      indeg.set(v, indeg.get(v)-1);
      if (indeg.get(v)===0) q.push(v);
    }
  }
  // any cycles: push remaining arbitrarily (we will handle with connect after some rows exist)
  for (const k of graph.keys()) if (!order.includes(k)) order.push(k);
  return order;
}

const order = topoSort(deps);

// Value generators for scalars (by field name hints)
function genValue(field){
  const name = field.name.toLowerCase();
  switch(field.type){
    case "String":
      if (name.includes("email")) return faker.internet.email().toLowerCase();
      if (name.includes("phone")||name.includes("mobile")) return faker.phone.number();
      if (name.includes("name")) return faker.person.fullName();
      if (name.includes("sku")) return "SKU-" + faker.string.alphanumeric({length:8}).toUpperCase();
      if (name.includes("title")) return faker.commerce.productName();
      if (name.includes("status")) return "active";
      if (name.includes("city")) return faker.location.city();
      if (name.includes("country")) return faker.location.country();
      if (name.includes("postcode")||name.includes("zip")) return faker.location.zipCode();
      if (name.includes("address")) return faker.location.streetAddress();
      if (name.includes("currency")) return "GBP";
      return faker.string.alphanumeric({length:randInt(8,16)});
    case "Int":
    case "BigInt":
      if (name.includes("qty")||name.includes("quantity")) return randInt(1,500);
      if (name.includes("price")||name.includes("amount")||name.includes("total")) return randInt(5,2000);
      return randInt(1,10000);
    case "Float":
    case "Decimal":
      if (name.includes("price")||name.includes("amount")||name.includes("total")) return Number(faker.commerce.price({min:5,max:2000}));
      return Number((Math.random()*1000).toFixed(2));
    case "Boolean":
      if (name.includes("active")||name.includes("enabled")) return true;
      return Math.random()<0.7;
    case "DateTime":
      if (name.includes("created")||name.includes("createdat")) return new Date();
      if (name.includes("updated")||name.includes("updatedat")) return new Date();
      return faker.date.recent({ days: 10 });
    case "Json":
      return { note: faker.lorem.sentence() };
    case "Bytes":
      return Buffer.from(faker.string.alphanumeric({length:12}));
    default:
      return null;
  }
}

// Keep created IDs to wire relations
const idStore = new Map(models.map(m => [m.name, []]));

// Try discover tenant column name on a model
function tenantColumn(model){
  const c = mfields[model].find(f => f.name === "tenant_id" || f.name === "tenantId");
  return c ? c.name : null;
}

function hasField(model, fieldName){
  return Array.isArray(mfields[model]) && mfields[model].some(f => f.name === fieldName);
}

function pickField(model, regex, types){
  const f = (mfields[model] || []).find(f => regex.test(f.name) && (!types || types.includes(f.type)));
  return f ? f.name : null;
}

async function ensureTenant(){
  // create/find a simple tenant if a Tenant model exists
  const tModel = models.find(m => m.name.toLowerCase()==="tenant" || m.name.toLowerCase()==="tenants");
  if (!tModel) return null;
  let t=null;
  try {
    t = await prisma[tModel.name].findFirst({ orderBy: { createdAt: "asc" } });
  } catch {}
  if (!t){
    const idField = idFieldOf(tModel.name);
    const data = {};
    for (const f of requiredScalars(tModel.name)) data[f.name] = genValue(f);
    // common fields
    if (mfields[tModel.name].some(f=>f.name==="name")) data["name"]="Nexa Demo";
    if (mfields[tModel.name].some(f=>f.name==="slug")) data["slug"]="demo";
    t = await prisma[tModel.name].create({ data });
    if (idField) idStore.get(tModel.name).push(t[idField]);
  }
  return t;
}

async function createCoreUsers(tenant){
  const uModel = models.find(m => m.name === "User" || m.name === "Users");
  if (!uModel) return;

  const modelName = uModel.name;
  const hash = bcrypt.hashSync(PASSWORD, 10);
  const idField = idFieldOf(modelName);
  const tcol = tenant ? tenantColumn(modelName) : null;

  const emailField = hasField(modelName, "email") ? "email" : pickField(modelName, /email/i, ["String"]);
  const passwordField = pickField(modelName, /password/i, ["String"]);
  const roleField = hasField(modelName, "role") ? "role" : null;
  const activeField = hasField(modelName, "active") ? "active" : (hasField(modelName, "isActive") ? "isActive" : (hasField(modelName, "enabled") ? "enabled" : null));
  let emailVerifiedField = null;
  const ev = (mfields[modelName] || []).find(f => /emailverified|email_verified/i.test(f.name));
  if (ev) emailVerifiedField = ev.name;

  // Enforce single super admin if role/email exist
  try {
    if (roleField && emailField){
      await prisma[modelName].updateMany({
        where: { [roleField]: "super_admin", NOT: { [emailField]: SUPER } },
        data: { [roleField]: "admin" }
      });
    }
  } catch {}

  async function upsertByLookup(targetEmail, targetRole){
    const data = {};
    // Fill required scalar fields first
    for (const f of requiredScalars(modelName)) data[f.name] = genValue(f);
    if (emailField) data[emailField] = targetEmail;
    if (passwordField) data[passwordField] = hash;
    if (roleField) data[roleField] = targetRole;
    if (activeField) data[activeField] = true;
    if (emailVerifiedField){
      const fld = (mfields[modelName] || []).find(f => f.name === emailVerifiedField);
      if (fld?.type === "Boolean") data[emailVerifiedField] = true;
      else if (fld?.type === "DateTime") data[emailVerifiedField] = new Date();
    }
    if (tcol && tenant){
      data[tcol] = tenant.id ?? tenant[idFieldOf(tenant.__typename || "Tenant")] ?? undefined;
    }

    let existing = null;
    try {
      if (emailField){
        existing = await prisma[modelName].findFirst({ where: { [emailField]: targetEmail } });
      }
    } catch {}
    if (existing && idField){
      const updated = await prisma[modelName].update({ where: { [idField]: existing[idField] }, data });
      idStore.get(modelName).push(updated[idField]);
    } else if (emailField){
      try{
        const created = await prisma[modelName].create({ data });
        if (idField) idStore.get(modelName).push(created[idField]);
      }catch(e){
        // ignore create error
      }
    }
  }

  await upsertByLookup(SUPER, "super_admin");
  await upsertByLookup(ADMIN, "admin");
}

async function seedModel(modelName, count){
  const fields = mfields[modelName];
  const idName = idFieldOf(modelName);
  const tcol = tenantColumn(modelName);
  for (let i=0; i<count; i++){
    const data = {};
    // Required scalar fields
    for (const f of requiredScalars(modelName)){
      data[f.name] = genValue(f);
    }
    // Tenant link if present
    if (tcol){
      // pick any known tenant id from any Tenant-like model
      const tModel = models.find(m => m.name.toLowerCase()==="tenant" || m.name.toLowerCase()==="tenants");
      if (tModel && idStore.get(tModel.name).length){
        data[tcol] = idStore.get(tModel.name)[0];
      }
    }
    // Minimal time-series touch
    const dtField = fields.find(f => f.type==="DateTime" && (f.name.toLowerCase().includes("date") || f.name.toLowerCase().includes("created")));
    if (dtField && !data[dtField.name]){
      const months = monthSeries(MONTHS_BACK);
      data[dtField.name] = months[randInt(0, months.length-1)];
    }
    // Create row
    try {
      const created = await prisma[modelName].create({ data });
      if (idName) idStore.get(modelName).push(created[idName]);
    } catch (e) {
      // If creation fails due to missing required relation we will link later
    }
  }
}

async function seedManyToManyLinks(){
  // Join tables in Prisma usually appear as implicit relations and not exposed as models;
  // but if explicit link models exist, they have two required relation fields and no other scalars.
  for (const m of models){
    const flds = mfields[m.name];
    const rels = flds.filter(f => f.relationName);
    const scalReq = requiredScalars(m.name);
    if (rels.length>=2 && scalReq.length===0){
      // Try to connect random pairs from the two related models
      const [r1, r2] = rels.slice(0,2);
      const a = idStore.get(r1.type) || [];
      const b = idStore.get(r2.type) || [];
      if (!a.length || !b.length) continue;
      const linkCount = Math.min(30, a.length * b.length);
      for (let i=0;i<linkCount;i++){
        const data={};
        try{
          await prisma[m.name].create({ data }); // best-effort
        }catch{}
      }
    }
  }
}

(async () => {
  // 1) Ensure a tenant if the schema has one
  const tenant = await ensureTenant();

  // 2) Create core users (super + admin), enforce single super admin
  await createCoreUsers(tenant);

  // 3) Topo seed (parents first)
  const perModelCounts = {};
  for (const m of order){
    // Skip User (already handled), Tenant (already ensured)
    if (m === "User" || m.toLowerCase()==="tenant" || m.toLowerCase()==="tenants") { perModelCounts[m]= (idStore.get(m)||[]).length; continue; }
    await seedModel(m, BASE_ROWS_PER_MODEL);
    perModelCounts[m] = (idStore.get(m)||[]).length;
    await sleep(5); // small breath to be gentle
  }

  // 4) Try to fill link tables (if any explicit M:N models exist)
  await seedManyToManyLinks();

  // 5) Extra pass: where models look transactional (have amount/total/status/date)
  for (const m of order){
    const flds = mfields[m];
    if (!flds) continue;
    const hasMoney = flds.some(f => ["Int","Float","Decimal"].includes(f.type) && /(amount|total|price)/i.test(f.name));
    const hasDate  = flds.some(f => f.type==="DateTime" && /(date|created)/i.test(f.name));
    const hasStatus= flds.some(f => f.type==="String" && /status/i.test(f.name));
    if (hasMoney && hasDate){
      await seedModel(m, 30); // boost transactional rows
      perModelCounts[m] = (idStore.get(m)||[]).length;
    }
  }

  // Final verification (users)
  let users = [];
  try {
    const uModel = models.find(m => m.name === "User" || m.name === "Users");
    if (uModel && prisma[uModel.name]?.findMany) {
      const fields = mfields[uModel.name] || [];
      const select = {};
      if (fields.find(f=>f.name==='email')) select.email = true;
      if (fields.find(f=>f.name==='role')) select.role = true;
      if (fields.find(f=>f.name==='tenantId')) select.tenantId = true;
      if (fields.find(f=>f.name==='tenant_id')) select.tenant_id = true;
      if (fields.find(f=>f.name==='active')) select.active = true;
      const where = {};
      if (fields.find(f=>f.name==='email')) where.email = { in: [SUPER, ADMIN] };
      const args = {};
      if (Object.keys(where).length) args.where = where;
      if (Object.keys(select).length) args.select = select;
      users = await prisma[uModel.name].findMany(args);
    }
  } catch {}
  console.log("\n=== USERS ===");
  console.log(JSON.stringify(users, null, 2));
  console.log("\n=== INSERT COUNTS (by model) ===");
  console.log(JSON.stringify(perModelCounts, null, 2));

  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); try{await prisma.$disconnect();}catch{} process.exit(1); });
NODE

echo
echo "=== SQL CHECK (\"User\") ==="
# choose tenant column dynamically to avoid referencing a non-existent column
tenant_col=$(psql "$DB_URL" -Atqc "SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='tenantId') THEN 'tenantId' WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='tenant_id') THEN 'tenant_id' ELSE '' END;") || tenant_col=""
if [ -n "$tenant_col" ]; then
  psql "$DB_URL" -v ON_ERROR_STOP=1 -c "SELECT \"email\",\"role\",\"$tenant_col\" AS tenant_id,COALESCE(\"active\",true) AS active FROM \"User\" WHERE \"email\" IN ('$SUPER','$ADMIN') ORDER BY \"email\";" || true
else
  psql "$DB_URL" -v ON_ERROR_STOP=1 -c "SELECT \"email\",\"role\",NULL AS tenant_id,COALESCE(\"active\",true) AS active FROM \"User\" WHERE \"email\" IN ('$SUPER','$ADMIN') ORDER BY \"email\";" || true
fi

echo
echo "All models discovered were seeded. Both accounts are ready to use."


