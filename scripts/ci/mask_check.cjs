const fs = require("fs");
const p = ".tmp/assistant-route.log";
if (!fs.existsSync(p)) { console.error("❌ Missing log:", p); process.exit(1); }
const s = fs.readFileSync(p, "utf8").replace(/\x1B\[[0-9;]*m/g, "");
const lines = s.split(/\r?\n/);
let blocks = 0, masked = 0, errs = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("[assistant_audit]")) {
    blocks++;
    const blk = lines.slice(i, i + 12).join("\n");
    if (!/hasMasked:\s*true/.test(blk)) errs.push();
    else masked++;
    if (/\b(\d{1,3}\.){3}\d{1,3}\b/.test(blk) && !/xxx/.test(blk)) errs.push();
  }
}
if (errs.length) { console.error("❌ Masking issues:\n" + errs.join("\n")); process.exit(1); }
console.log();
