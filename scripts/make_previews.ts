import fs from "fs";
import path from "path";
const APP_DIR = "apps/web/public/modules";
const ADMIN_DIR = "apps/web/public/modules-admin";
const OUT = "apps/web/public/previews";

type Entry = { route: string; jsonFile: string; title: string; area: "app"|"admin" };

function list(dir: string): string[] {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f=>f.endsWith(".json")).sort() : [];
}

const appFiles = list(APP_DIR);
const adminFiles = list(ADMIN_DIR);

const entries: Entry[] = [];
for (const f of appFiles) {
  const j = JSON.parse(fs.readFileSync(path.join(APP_DIR, f), "utf8"));
  const route = "/app/" + f.replace(".json","").replace(/\./g,"/");
  entries.push({ route, jsonFile: f, title: j.title || f, area: "app" });
}
for (const f of adminFiles) {
  const j = JSON.parse(fs.readFileSync(path.join(ADMIN_DIR, f), "utf8"));
  const route = "/admin/" + f.replace(/^admin\./,"").replace(".json","");
  entries.push({ route, jsonFile: f, title: j.title || f, area: "admin" });
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "_index.json"), JSON.stringify(entries, null, 2));
console.log("Routes indexed:", entries.length);

