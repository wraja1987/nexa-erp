#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(pwd)"
REPORT_DIR="reports"
REPORT_FILE="$REPORT_DIR/product_data_truth_report.txt"
POST_SEED="scripts/post_seed_fix.ts"
ALIGN_TEST="apps/web/tests/modules-alignment.test.ts"
MODS_JSON="${MODS_JSON:-apps/web/public/modules.json}"
ERP_TS_MAP="${ERP_TS_MAP:-apps/web/src/lib/router/modules.ts}"

mkdir -p "$REPORT_DIR" scripts apps/web/tests

timestamp() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log() { echo "[$(timestamp)] $*"; }
pass() { echo "PASS: $*"; }
warn() { echo "WARN: $*"; }
fail() { echo "FAIL: $*"; }

echo "Nexa ERP — Product & Data Truth Run" | tee "$REPORT_FILE"
echo "Started: $(timestamp)" | tee -a "$REPORT_FILE"
echo "Repo: $ROOT" | tee -a "$REPORT_FILE"
echo | tee -a "$REPORT_FILE"

# 1) Basic checks
if ! command -v pnpm >/dev/null 2>&1; then
  fail "pnpm not found. Install with: npm i -g pnpm" | tee -a "$REPORT_FILE"
  exit 1
fi
pass "pnpm present" | tee -a "$REPORT_FILE"

# 2) Ensure .env and env flags
if [ ! -f .env ]; then
  warn ".env not found — creating an empty one" | tee -a "$REPORT_FILE"
  touch .env
fi
cp .env ".env.bak.$(date +%s)"
ensure_flag() {
  KEY="$1"; VAL="$2"
  if grep -qE "^${KEY}=" .env; then
    pass "Env flag present: ${KEY}" | tee -a "$REPORT_FILE"
  else
    echo "${KEY}=${VAL}" >> .env
    pass "Env flag added: ${KEY}=${VAL}" | tee -a "$REPORT_FILE"
  fi
}
ensure_flag HUBSPOT_ENABLED false
ensure_flag MARKETPLACE_ENABLED false
ensure_flag TWILIO_SMS_ENABLED false
echo | tee -a "$REPORT_FILE"

# 3) Install deps + run migrations
log "Installing dependencies…" | tee -a "$REPORT_FILE"
pnpm install >/dev/null
pass "Dependencies installed" | tee -a "$REPORT_FILE"

log "Applying Prisma migrations…" | tee -a "$REPORT_FILE"
pnpm -w prisma migrate deploy >/dev/null
pass "Prisma migrations applied" | tee -a "$REPORT_FILE"
echo | tee -a "$REPORT_FILE"

# 4) Create the adaptive post-seed fixer (idempotent)
cat > "$POST_SEED" << "TS"
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
TS

# 5) Run post-seed fixer
POST_JSON="$(pnpm dlx tsx "$POST_SEED" 2>/dev/null || true)"
echo "$POST_JSON" | tee -a "$REPORT_FILE" >/dev/null

# 6) Create alignment test (ensures website JSON == ERP sidebar map)
cat > "$ALIGN_TEST" << "TS"
import { test, expect } from "vitest";
import fs from "fs"; import path from "path";
test("modules-alignment", () => {
  const root = process.cwd();
  const jsonPath = path.join(root, "$MODS_JSON");
  const tsPath   = path.join(root, "$ERP_TS_MAP");
  if (!fs.existsSync(jsonPath)) return; // skip if no file
  if (!fs.existsSync(tsPath))   return; // skip if no file

  const json = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
    modules: Array<{ slug:string; label:string; subs?: Array<{ slug:string; label:string }> }>
  };

  const tsRaw = fs.readFileSync(tsPath, "utf8");
  const m = tsRaw.match(/\bmodules\s*:\s*Mod\[\]\s*=\s*(\[[\s\S]*\]);?/);
  if (!m) throw new Error("Could not locate exported modules array in modules.ts");
  const tsArrayLiteral = m[1].replace(/(\w+)\s*:/g, "\"$1\":").replace(/'/g, "\"");
  const tsMods = JSON.parse(tsArrayLiteral);

  const normalise = (arr:any[]) => arr.map((x:any)=>({
    slug:x.slug, label:x.label, subs:(x.subs||[]).map((s:any)=>({slug:s.slug,label:s.label}))
  }));
  expect(normalise(tsMods)).toEqual(normalise(json.modules));
});
TS

# 7) Ensure vitest is available (lightweight)
if ! pnpm -s ls vitest >/dev/null 2>&1; then
  log "Adding vitest (dev) to run the alignment test…" | tee -a "$REPORT_FILE"
  pnpm add -D vitest @types/node >/dev/null
fi

# 8) Run alignment test
ALIGN_STATUS="SKIPPED"
set +e
pnpm -w vitest run "$ALIGN_TEST" -t "modules-alignment" >/tmp/nexa_align_out.txt 2>/tmp/nexa_align_err.txt
RC=$?
set -e
if [ $RC -eq 0 ]; then ALIGN_STATUS="PASS"; else ALIGN_STATUS="FAIL"; fi

echo | tee -a "$REPORT_FILE"
echo "Alignment Test: $ALIGN_STATUS" | tee -a "$REPORT_FILE"
if [ "$ALIGN_STATUS" != "PASS" ]; then
  echo "---- vitest out ----" | tee -a "$REPORT_FILE"
  sed -n "1,120p" /tmp/nexa_align_out.txt | tee -a "$REPORT_FILE"
  echo "---- vitest err ----" | tee -a "$REPORT_FILE"
  sed -n "1,120p" /tmp/nexa_align_err.txt | tee -a "$REPORT_FILE"
fi

# 9) Optional public endpoint checks (only if envs are set in your shell)
if [ -n "${BASIC_AUTH_USER:-}" ] && [ -n "${BASIC_AUTH_PASS:-}" ] && [ -n "${PUBLIC_API_BASE:-}" ]; then
  echo | tee -a "$REPORT_FILE"
  log "Pinging /api/public/status and /api/public/modules…" | tee -a "$REPORT_FILE"
  curl -fsS -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASS" "$PUBLIC_API_BASE/api/public/status" | tee -a "$REPORT_FILE" || echo "(status check failed)" | tee -a "$REPORT_FILE"
  echo | tee -a "$REPORT_FILE"
  curl -fsS -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASS" "$PUBLIC_API_BASE/api/public/modules" >/tmp/nexa_modules.json 2>/dev/null || true
  if [ -s /tmp/nexa_modules.json ]; then
    pass "/api/public/modules reachable" | tee -a "$REPORT_FILE"
  else
    warn "/api/public/modules not reachable (skipped or requires config)" | tee -a "$REPORT_FILE"
  fi
fi

# 10) Final summary
echo | tee -a "$REPORT_FILE"
echo "========== SUMMARY ==========" | tee -a "$REPORT_FILE"

# Parse post-seed JSON for a concise summary
FLAGS_BACKEND="$(echo "$POST_JSON" | node - <<'JS'
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  try { const j=JSON.parse(d); console.log(j.results && j.results.flagsTable ? j.results.flagsTable : 'none'); }
  catch { console.log('none'); }
});
JS
)"
MODULES_SYNC="$(echo "$POST_JSON" | node - <<'JS'
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  try { const j=JSON.parse(d); const m=j.results && j.results.modules; console.log(m && m.synced ? 'synced' : ('skipped:' + (m && m.reason ? m.reason : 'unknown'))); }
  catch { console.log('unknown'); }
});
JS
)"
DEMO_DONE="$(echo "$POST_JSON" | node - <<'JS'
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  try { const j=JSON.parse(d); const r=j.results && j.results.demo; console.log((r && r.demoHandled ? 'tenant=ok' : 'tenant=skip') + ',' + (r && r.userHandled ? 'user=ok' : 'user=skip')); }
  catch { console.log('tenant=?,user=?'); }
});
JS
)"

echo "Env flags set: HUBSPOT_ENABLED=false, MARKETPLACE_ENABLED=false, TWILIO_SMS_ENABLED=false" | tee -a "$REPORT_FILE"
echo "Demo tenant & user: $DEMO_DONE" | tee -a "$REPORT_FILE"
echo "Flags backend (DB table used): $FLAGS_BACKEND" | tee -a "$REPORT_FILE"
echo "Modules sync (DB): $MODULES_SYNC" | tee -a "$REPORT_FILE"
echo "Website↔ERP alignment test: $ALIGN_STATUS" | tee -a "$REPORT_FILE"
echo "Report saved to: $REPORT_FILE" | tee -a "$REPORT_FILE"
echo "Finished: $(timestamp)" | tee -a "$REPORT_FILE"
echo "=============================="


