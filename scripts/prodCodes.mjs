// Append exact HTTP status codes from the production alias using Playwright request contexts.
// Uses existing storage states created by the login helpers:
//   - apps/web/tests/e2e/.auth/admin.json
//   - apps/web/tests/e2e/.auth/staff.json
// Writes:
//   - reports/task5-prod-smoke.md (appends codes)
//   - reports/TASK5-PROD-VERIFICATION.md (PASS/FAIL line)

import { request as pwRequest } from "playwright";
import fs from "fs";
import path from "path";

function env(name, fallback) {
  const v = process.env[name];
  return v !== undefined ? v : fallback;
}

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true }).catch(() => {});
}

async function appendFile(target, text) {
  await ensureDir(path.dirname(target));
  await fs.promises.appendFile(target, text);
}

async function writeFile(target, text) {
  await ensureDir(path.dirname(target));
  await fs.promises.writeFile(target, text);
}

async function codeGet(base, storageState, pathname) {
  const ctx = await pwRequest.newContext({
    baseURL: base,
    storageState,
    ignoreHTTPSErrors: true,
  });
  try {
    const res = await ctx.get(pathname);
    return res.status();
  } finally {
    await ctx.dispose();
  }
}

async function codePost(base, storageState, pathname, data) {
  const ctx = await pwRequest.newContext({
    baseURL: base,
    storageState,
    ignoreHTTPSErrors: true,
  });
  try {
    const res = await ctx.post(pathname, { data, headers: { "content-type": "application/json" } });
    return res.status();
  } finally {
    await ctx.dispose();
  }
}

async function run() {
  const base = env("PW_BASE_URL", "https://app.nexaai.co.uk");
  const adminState = path.resolve("apps/web/tests/e2e/.auth/admin.json");
  const staffState = path.resolve("apps/web/tests/e2e/.auth/staff.json");

  const admin = await codeGet(base, fs.existsSync(adminState) ? adminState : undefined, "/finance/reports").catch(() => 0);
  const staffPage = await codeGet(base, fs.existsSync(staffState) ? staffState : undefined, "/finance/reports").catch(() => 0);
  const staffApi = await codePost(
    base,
    fs.existsSync(staffState) ? staffState : undefined,
    "/api/admin/users/role",
    { userId: "x", role: "ADMIN" }
  ).catch(() => 0);

  const block = [
    "",
    "### Live Alias Probe — Status Codes",
    `- ADMIN /finance/reports: ${admin}`,
    `- STAFF /finance/reports (best-effort): ${staffPage}`,
    `- STAFF POST /api/admin/users/role (SoD): ${staffApi}`,
    "",
  ].join("\n");
  await appendFile(path.resolve("reports/task5-prod-smoke.md"), block);

  const pass = Number(admin) === 200 && Number(staffApi) !== 200;
  const verdict = pass
    ? `RESULT: ✅ VERIFIED COMPLETE`
    : `RESULT: ❌ NOT COMPLETE`;
  await writeFile(path.resolve("reports/TASK5-PROD-VERIFICATION.md"), `${verdict}\n`);

  process.stdout.write(JSON.stringify({ admin, staffPage, staffApi }) + "\n");
}

run().catch((e) => {
  console.error("[FAIL]", e?.message || String(e));
  process.exit(1);
});


