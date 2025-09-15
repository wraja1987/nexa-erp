import { execSync } from "child_process";
import { mkdirSync, existsSync, writeFileSync, readFileSync, statSync } from "fs";
import { format } from "date-fns";
import { Audit } from "../apps/api/src/lib/audit/index";

type Mode = "backup" | "restore" | "report" | "run";
const REPORTS = "reports";
if (!existsSync(REPORTS)) mkdirSync(REPORTS);

function envOrThrow(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}
function shell(cmd: string) { return execSync(cmd, { stdio: "pipe" }).toString().trim(); }
function nowTag() { return format(new Date(), "yyyyMMdd-HHmmss"); }

function stripQuery(connectionUrl: string): string {
  // Remove any query string like ?schema=public which pg tools don't accept
  return connectionUrl.replace(/\?.*$/, "");
}

function latestBackup(): string | null {
  const fs = require("fs");
  const files = fs.readdirSync("reports").filter((f: string) => f.startsWith("backup-") && f.endsWith(".sql")).sort();
  return files.length ? `reports/${files[files.length - 1]}` : null;
}

function backup() {
  const url = stripQuery(envOrThrow("DATABASE_URL"));
  const tag = nowTag();
  const dump = `reports/backup-${tag}.sql`;
  const t0 = Date.now();
  shell(`pg_dump --no-owner --no-privileges --format=plain "${url}" > ${dump}`);
  const seconds = (Date.now() - t0) / 1000;
  Audit.audit({ type: "drill.backup", actor: "job:drill", ok: true, target: "postgres", details: { dump, seconds }});
  console.log(JSON.stringify({ ok: true, dump, seconds }, null, 2));
}

function restore() {
  const rawUrl = envOrThrow("DATABASE_URL");
  const url = stripQuery(rawUrl);
  const adminUrl = url.replace(/(postgresql:\/\/[^\/]+\/)([^?]+)/, `$1postgres`);
  const dump = latestBackup();
  if (!dump) throw new Error("No backup found in /reports");
  const drillDb = process.env.DRILL_DATABASE || "nexa_drill";

  shell(`psql "${adminUrl}" -c "SELECT 1" >/dev/null`);
  shell(`psql "${adminUrl}" -c "DROP DATABASE IF EXISTS ${drillDb};"`);
  shell(`psql "${adminUrl}" -c "CREATE DATABASE ${drillDb};"`);

  const drillUrl = url.replace(/(postgresql:\/\/[^\/]+\/)([^?]+)/, `$1${drillDb}`);
  const t0 = Date.now();
  shell(`psql "${drillUrl}" < ${dump}`);
  const seconds = (Date.now() - t0) / 1000;

  Audit.audit({ type: "drill.restore", actor: "job:drill", ok: true, target: drillDb, details: { source: dump, seconds }});
  writeFileSync("reports/drill-latest.json", JSON.stringify({ drillDb, source: dump, restoreSeconds: seconds, at: new Date().toISOString() }, null, 2));
  console.log(JSON.stringify({ ok: true, drillDb, source: dump, restoreSeconds: seconds }, null, 2));
}

function report() {
  const dump = latestBackup();
  const meta = existsSync("reports/drill-latest.json") ? JSON.parse(readFileSync("reports/drill-latest.json","utf8")) : null;
  const rpoSeconds = dump ? Math.floor((Date.now() - statSync(dump).mtime.getTime())/1000) : null;
  const file = `reports/DR-Report-${nowTag()}.md`;
  const md = `# Nexa Backups & DR Drill Report

- Date: ${new Date().toISOString()}
- Latest Backup: ${dump ?? "N/A"}
- Restore Target DB: ${meta?.drillDb ?? "N/A"}
- Restore Duration (RTO portion): ${meta?.restoreSeconds ?? "N/A"} seconds
- RPO (seconds since latest backup file): ${rpoSeconds ?? "N/A"}

## Notes
- RPO equals time since the last successful backup.
- Drill restores into a temporary database (safety).
- See reports/audit.jsonl for 'drill.backup' and 'drill.restore'.`;
  writeFileSync(file, md);
  Audit.audit({ type: "drill.report", actor: "job:drill", ok: true, target: "reports", details: { file }});
  console.log(JSON.stringify({ ok: true, file }, null, 2));
}

const mode = (process.argv[2] || "run") as Mode;
if (mode === "backup") backup();
else if (mode === "restore") restore();
else if (mode === "report") report();
else { backup(); restore(); report(); }


