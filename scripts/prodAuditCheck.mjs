// Production audit spot-check helper
// - Attempts to fetch recent audit rows from a safe diag endpoint (if exposed)
// - Appends results to reports/task5-rbac-audit.md
// - If unavailable in production, writes instructions for manual verification

import { request as pwRequest } from "playwright";
import fs from "fs";
import path from "path";

function env(name, fallback) {
  const v = process.env[name];
  if (v !== undefined && String(v).length > 0) return v;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env: ${name}`);
}

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true }).catch(() => {});
}

async function appendFile(target, text) {
  await ensureDir(path.dirname(target));
  await fs.promises.appendFile(target, text);
}

function nowUtc() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function run() {
  const baseUrl = env("PW_BASE_URL", "https://app.nexaai.co.uk");
  const bypassToken = process.env.BYPASS_TOKEN || "";
  const report = path.join("reports", "task5-rbac-audit.md");

  const ctx = await pwRequest.newContext({
    baseURL: baseUrl,
    extraHTTPHeaders: bypassToken ? { "x-vercel-protection-bypass": bypassToken } : {},
    ignoreHTTPSErrors: true,
  });
  let content = "";
  try {
    const res = await ctx.get("/api/_diag/audit-last");
    if (res.ok()) {
      const txt = await res.text();
      content = txt.split("\n").slice(0, 100).join("\n");
    } else {
      content = `- [note] audit diag endpoint returned ${res.status()} (${res.statusText()}); manual DB verification recommended.`;
    }
  } catch (e) {
    content = `- [note] audit diag endpoint not accessible; manual DB verification recommended.`;
  } finally {
    await ctx.dispose();
  }

  const block = [
    ``,
    `## Production Audit Spot-Check (${nowUtc()})`,
    `- Base: ${baseUrl}`,
    `- Recent audit rows (if available):`,
    ``,
    "```",
    content || "(none)",
    "```",
    ``,
    `If empty or unavailable, run locally against production DB and paste the last 5 rows:`,
    `- curl -fsSL '${baseUrl}/api/_diag/audit-last' | head -n 50`,
    ``,
  ].join("\n");
  await appendFile(report, block);
  process.stdout.write("Audit spot-check appended.\n");
}

run().catch((e) => {
  console.error("[FAIL]", e?.message || String(e));
  process.exit(1);
});


