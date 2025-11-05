import fs from "fs";
import path from "path";

const roots = [
  path.join(process.cwd(), "apps/web/src"),
  path.join(process.cwd(), "apps/web/app"),
];

function listFiles(dir: string, acc: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, acc);
    else if (e.isFile() && /\.(ts|tsx|js|jsx)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function checkFile(file: string): string[] {
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split(/\r?\n/);
  const issues: string[] = [];
  lines.forEach((line, idx) => {
    const m = line.match(/prisma\.(\w+)\.(findFirst|findMany|updateMany|deleteMany|count|aggregate)\s*\(/);
    if (m) {
      // naive window scan for tenantId mention in nearby lines
      const window = lines.slice(Math.max(0, idx - 5), Math.min(lines.length, idx + 15)).join("\n");
      if (!/tenantId\s*:/.test(window)) {
        issues.push(`${file}:${idx + 1} -> prisma.${m[1]}.${m[2]}(...) missing tenantId in where:`);
      }
    }
  });
  return issues;
}

function main() {
  const files = roots.flatMap((r) => (fs.existsSync(r) ? listFiles(r) : []));
  const problems = files.flatMap(checkFile);
  if (problems.length) {
    console.error("Found potential unscoped Prisma queries:\n" + problems.join("\n"));
    process.exit(1);
  }
  console.log("All Prisma queries appear tenant-scoped (heuristic).");
}

main();


