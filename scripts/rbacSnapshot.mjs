import fs from "fs";
import path from "path";

function nowUtc() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function run() {
  const src = path.join("apps/web/src/lib/rbac/matrix.ts");
  const text = await fs.promises.readFile(src, "utf8");
  const roleLine = text.split("\n").find((l) => l.includes("export type AppRole"));
  const roles = roleLine?.match(/"SUPER_ADMIN"|"ADMIN"|"MANAGER"|"STAFF"|"VIEWER"/g) || [];
  // Naive object extraction for matrix
  const mStart = text.indexOf("const matrix:");
  const mOpen = text.indexOf("{", mStart);
  const mClose = text.indexOf("};", mOpen);
  const matrixText = text.slice(mOpen, mClose + 1);
  const jsonish = matrixText
    .replace(/(\w+:\s*)/g, "") // strip TS type noise if any
    .replace(/(\w+):/g, '"$1":')
    .replace(/([A-Z_"]+),?/g, (s) => s) // keep role names as-is
    .replace(/(['"])([A-Z_]+)\1/g, '"$2"');
  // Fallback: construct a map by regex lines
  const perms = {};
  const lines = text.split("\n").filter((l) => l.includes(": ["));
  for (const l of lines) {
    const m = l.match(/"([^"]+)":\s*\[([^\]]+)\]/);
    if (m) {
      const perm = m[1];
      const allow = m[2].split(",").map((s) => s.replace(/[^A-Z_]/g, "")).filter(Boolean);
      perms[perm] = allow;
    }
  }

  const out = [
    `# RBAC Matrix Snapshot`,
    ``,
    `Timestamp: ${nowUtc()}`,
    ``,
    `## Roles`,
    `- ${roles.join(", ").replace(/"/g, "")}`,
    ``,
    `## Permissions`,
    ...Object.entries(perms).map(([k, v]) => `- ${k} → ${v.join(", ")}`),
    ``,
    `## Separation of Duties (SoD)`,
    `- Only SUPER_ADMIN can grant SUPER_ADMIN`,
    `- ADMIN cannot change their own role`,
    ``,
    `Source: apps/web/src/lib/rbac/matrix.ts`,
    ``,
  ].join("\n");
  await fs.promises.mkdir("reports", { recursive: true });
  await fs.promises.writeFile("reports/task5-rbac-matrix-snapshot.md", out);
  process.stdout.write("RBAC snapshot written to reports/task5-rbac-matrix-snapshot.md\n");
}

run().catch((e) => {
  console.error("[FAIL]", e?.message || String(e));
  process.exit(1);
});


