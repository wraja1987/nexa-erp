import fs from "fs";
const typesPath = ".selfheal/types.txt";
const types = fs.existsSync(typesPath) ? fs.readFileSync(typesPath, "utf-8").split(",").filter(Boolean) : [];
const unfixable = [];
for (const t of types) {
  if (["missing-headers"].includes(t)) continue;      // we attempt to fix
  if (["health-endpoint","login","no-report"].includes(t)) unfixable.push(t);
}
const map = {
  "health-endpoint": "- Health/Status endpoint failed (check /health or /status).",
  "login": "- /login failed to load or title missing.",
  "no-report": "- No Playwright JSON report (config/env issue).",
};
const lines = unfixable.map(u => map[u] || `- ${u}`);
const body = [
  "### Self-Heal Summary",
  types.length ? `Detected: ${types.join(", ")}` : "Detected: none",
  lines.length ? "Unfixable:\n" + lines.join("\n") : "Unfixable: none",
].join("\n\n");
fs.writeFileSync(".selfheal/summary.md", body+"\n");
console.log(body);
