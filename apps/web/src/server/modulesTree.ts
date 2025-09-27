import fs from "fs";
import path from "path";

export function getModulesTree() {
  const pubA = path.join(process.cwd(), "apps", "web", "public", "modules");
  const pubB = path.join(process.cwd(), "public", "modules");
  const pub = fs.existsSync(pubA) ? pubA : pubB;
  if (!fs.existsSync(pub)) return [] as any[];
  const files = fs.readdirSync(pub).filter(f => f.endsWith(".json")).sort();
  return files.map(f => ({
    name: f.replace(/\.json$/, ""),
    path: `/app/${f.replace(/\.json$/, "").replace(/-/g, "/")}`,
  }));
}
