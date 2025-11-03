/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
const appDir = path.join(process.cwd(), "apps", "web", "app");
const manifestPath = path.join(process.cwd(), "apps", "web", "scripts", "route-manifest.json");
function routeToRel(p: string) {
  return p.replace(/^\//, "");
}
function hasRouteIn(dir: string, rel: string): boolean {
  const folder = path.join(dir, rel);
  // Accept either the directory itself or a page.tsx file inside it.
  return fs.existsSync(folder) || fs.existsSync(path.join(folder, "page.tsx"));
}
function existsInAnyGroup(rel: string): boolean {
  // 1) direct (no group)
  if (hasRouteIn(appDir, rel)) return true;
  // 2) any top-level route group, e.g. (app)
  const entries = fs.readdirSync(appDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && e.name.startsWith("(") && e.name.endsWith(")")) {
      const groupDir = path.join(appDir, e.name);
      if (hasRouteIn(groupDir, rel)) return true;
    }
  }
  return false;
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
    const top = routeToRel(m.path);
    if (!existsInAnyGroup(top)) missing.push(m.path);
    if (m.children) {
      for (const c of m.children) {
        const child = routeToRel(c.path);
        if (!existsInAnyGroup(child)) missing.push(c.path);
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


