import fs from "fs";
const OUTDIR = ".selfheal";
const REPORT = "reports/playwright.json";
fs.mkdirSync(OUTDIR, { recursive: true });

let types = [];
try {
  const json = JSON.parse(fs.readFileSync(REPORT, "utf-8"));
  const tests = (json.suites?.[0]?.suites || []).flatMap(s => s.specs || []);
  const failed = tests.filter(t => (t.tests||[]).some(tt => tt.results?.some(r => r.status !== "passed")));
  const names = failed.map(f => f.title).join(" || ");

  if (/health\/status/i.test(names)) types.push("health-endpoint");
  if (/login page loads/i.test(names)) types.push("login");
  if (/security headers/i.test(names)) types.push("missing-headers");
} catch (e) {
  types.push("no-report");
}

const payload = types.join(",");
fs.writeFileSync(`${OUTDIR}/types.txt`, payload);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `types=${payload}\n`);
}
console.log("Classified failure types:", payload || "(none)");
