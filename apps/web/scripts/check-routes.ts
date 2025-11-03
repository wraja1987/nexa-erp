/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

const appDir = path.join(process.cwd(), "apps", "web", "app");
const manifestPath = path.join(process.cwd(), "apps", "web", "scripts", "route-manifest.json");

function exists(rel: string) {
  const full = path.join(appDir, rel);
  return fs.existsSync(full);
}

function routeToFolder(p: string) {
  return p.replace(/^\//, "");
}

function main() {
  if (!fs.existsSync(manifestPath)) {
    console.error("route-manifest.json not found at", manifestPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as {
    modules: Array<{ id: string; path: string; children?: Array<{ id: string; path: string }> }>;
  };

  const missing: string[] = [];

  for (const m of manifest.modules) {
    const top = routeToFolder(m.path);
    if (!exists(top)) missing.push(m.path);
    if (m.children) {
      for (const c of m.children) {
        const child = routeToFolder(c.path);
        if (!exists(child)) missing.push(c.path);
      }
    }
  }

  if (missing.length) {
    console.error("Missing routes:");
    for (const r of missing) console.error(" -", r);
    process.exit(1);
  }

  console.log("All routes in route-manifest.json exist.");
}

main();


