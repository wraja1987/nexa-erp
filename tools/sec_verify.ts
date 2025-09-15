import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, statSync } from "fs";
import { format } from "date-fns";

if (!existsSync("reports")) mkdirSync("reports");
function sh(cmd: string) { return execSync(cmd, { stdio: "pipe" }).toString().trim(); }
function now() { return format(new Date(), "yyyyMMdd-HHmmss"); }

type Check = { name: string; ok: boolean; details?: string; meta?: Record<string, any> };
const checks: Check[] = [];
function record(name: string, fn: () => void) {
  try { fn(); checks.push({ name, ok: true }); }
  catch (e: any) { checks.push({ name, ok: false, details: e?.message || String(e) }); }
}
function jsonOf(s: string) { try { return JSON.parse(s); } catch { return null; } }

record("ENV: DATABASE_URL present", () => { if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing"); });
record("ENV: NEXA_KMS_MASTER present (base64 32B)", () => {
  const b64 = process.env.NEXA_KMS_MASTER; if (!b64) throw new Error("NEXA_KMS_MASTER missing");
  const buf = Buffer.from(b64, "base64"); if (buf.length !== 32) throw new Error("NEXA_KMS_MASTER must decode to 32 bytes");
});

record("DR: backup/restore/report", () => {
  sh("pnpm -s dr:run");
  const latestReport = sh(`ls -1t reports/DR-Report-*.md | head -n 1`);
  if (!latestReport) throw new Error("No DR report generated");
  const dump = sh(`ls -1t reports/backup-*.sql | head -n 1`);
  if (!dump) throw new Error("No backup file generated");
  const rpoSec = Math.floor((Date.now() - statSync(dump).mtime.getTime()) / 1000);
  checks.push({ name: "DR: RPO seconds", ok: true, meta: { rpoSec } });
});

record("Retention: job audited", () => {
  const out = sh("pnpm -s jobs:retention:run");
  if (!/\"ok\"\s*:\s*true/.test(out)) throw new Error("Retention job did not return ok:true");
});

record("BYOK: info/verify/rotate/verify", () => {
  const tid = process.env.NEXA_VERIFY_TENANT_ID || "demo-tenant";
  sh(`pnpm -s byok:info -- ${tid}`);
  const v1 = jsonOf(sh(`pnpm -s byok:verify -- ${tid}`)); if (!v1?.ok) throw new Error("BYOK verify before rotate failed");
  sh(`pnpm -s byok:rotate -- ${tid}`);
  const v2 = jsonOf(sh(`pnpm -s byok:verify -- ${tid}`)); if (!v2?.ok) throw new Error("BYOK verify after rotate failed");
});

record("GDPR/PECR: pages + consent gate", () => {
  const j = jsonOf(sh("pnpm -s gdpr:check")) || {};
  if (!j.okPages) throw new Error("Required policy pages missing");
  if (!j.plausibleGated) throw new Error("Plausible not gated by consent");
});

const passed = checks.filter(c => c.ok).length, failed = checks.length - passed;
const file = `reports/Security-Verification-${now()}.md`;
const md = `# Nexa Security & Compliance — End-to-End Verification

- Date: ${new Date().toISOString()}
- Passed: ${passed}
- Failed: ${failed}

## Results
${checks.map(c => `- **${c.name}** — ${c.ok ? "OK" : "FAIL"}${c.details ? ` — ${c.details}` : ""}${c.meta ? ` — ${JSON.stringify(c.meta)}` : ""}`).join("\n")}

## Artefacts
- DR Report: latest \`reports/DR-Report-*.md\`
- Backups: \`reports/backup-*.sql\`
- Audit trail: \`reports/audit.jsonl\`

> Re-run: \`pnpm sec:verify\`
`;
writeFileSync(file, md);
console.log(JSON.stringify({ ok: failed === 0, file, passed, failed }, null, 2));




