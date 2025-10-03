import fs from "fs";
import path from "path";
const ROOT = process.env.PROJECT_ROOT || process.cwd();
const REPORTS = path.resolve(ROOT, "..", "..", "reports");
const FILE = path.join(REPORTS, "audit.jsonl");
export function auditLog(entry: Record<string, any>) {
  try { if (!fs.existsSync(REPORTS)) fs.mkdirSync(REPORTS, { recursive: true }); } catch {}
  try {
    const payload = { ts: new Date().toISOString(), ...entry };
    fs.appendFile(FILE, JSON.stringify(payload) + "\n", { encoding: "utf8" }, () => {});
  } catch {}
}
