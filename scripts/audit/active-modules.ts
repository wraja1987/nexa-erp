import fs from "node:fs";
import path from "node:path";

// 1) Load module registry (truth source)
let registry:any;
try {
  // The registry should export an array like: modules = [{ id, name, slug, status, route, description, category, tags }]
  registry = await import("@nexa/registry");
} catch (e) {
  console.error("Failed to import @nexa/registry. Make sure packages/registry is built and path aliases work.");
  process.exit(1);
}
const modules = (registry.modules || registry.default || []).filter(Boolean);

// 2) Filter to active modules only
type Mod = {
  id?: string;
  name: string;
  slug?: string;
  status?: string;
  route?: string;
  description?: string;
  category?: string;
  tags?: string[];
};
const active = (modules as Mod[]).filter(m => (m.status || "active").toLowerCase() === "active");

// 3) Verify that each active module is actually surfaced in the web app (route exists)
const webAppRoot = path.resolve("apps/web/src/app");
function routeExists(route?: string) {
  if (!route) return false;
  const clean = route.replace(/^\//, "");
  const candidates = [
    path.join(webAppRoot, clean, "page.tsx"),
    path.join(webAppRoot, clean, "page.ts"),
    path.join(webAppRoot, clean, "page.jsx"),
    path.join(webAppRoot, clean, "page.js"),
    // Also support (app) group routing patterns
    ...["(app)","(routes)"].map(group => path.join(webAppRoot, group, clean, "page.tsx")),
    ...["(app)","(routes)"].map(group => path.join(webAppRoot, group, clean, "page.ts")),
    ...["(app)","(routes)"].map(group => path.join(webAppRoot, group, clean, "page.jsx")),
    ...["(app)","(routes)"].map(group => path.join(webAppRoot, group, clean, "page.js")),
  ];
  return candidates.some(f => fs.existsSync(f));
}

const timestamp = new Date().toISOString().replace(/[-:]/g,"").replace(/\..+/, "");
const jsonOut = path.resolve(`reports/active-modules-${timestamp}.json`);
const mdOut   = path.resolve(`reports/active-modules-${timestamp}.md`);

const validated = active.map(m => {
  const exists = routeExists(m.route);
  return {
    id: m.id || m.slug || m.name.toLowerCase().replace(/\s+/g,"-"),
    name: m.name,
    route: m.route || null,
    category: m.category || null,
    tags: m.tags || [],
    description: (m.description || "").trim(),
    status: m.status || "active",
    routeFound: exists
  };
});

// 4) Keep only truly “active & routed” items for the document; list any anomalies separately
const trulyActive = validated.filter(v => v.routeFound);
const anomalies = validated.filter(v => !v.routeFound);

// 5) Write JSON
fs.writeFileSync(jsonOut, JSON.stringify({ generatedAt: new Date().toISOString(), active: trulyActive, anomalies }, null, 2), "utf8");

// 6) Write Markdown in simple British English
const lines: string[] = [];
lines.push(`# Nexa ERP — Active Modules`);
lines.push("");
lines.push(`Generated: ${new Date().toUTCString()}`);
lines.push("");
lines.push(`This document lists the modules that are active and visible in the ERP, confirmed by the presence of working routes in the web application.`);
lines.push("");
if (trulyActive.length === 0) {
  lines.push(`**No active modules were detected with a confirmed route.** If you believe this is incorrect, ensure the registry marks modules as **status: "active"** and that each module has a valid **route** with a matching **page.tsx** (or .ts/.jsx/.js) file.`);
} else {
  for (const m of trulyActive.sort((a,b)=>a.name.localeCompare(b.name))) {
    lines.push(`## ${m.name}`);
    if (m.description) {
      lines.push(m.description);
    } else {
      lines.push(`A functional module within Nexa ERP. (No description found in the registry.)`);
    }
    if (m.category) lines.push(`- **Category:** ${m.category}`);
    if (m.route) lines.push(`- **Route:** ${m.route}`);
    if (m.tags && m.tags.length) lines.push(`- **Tags:** ${m.tags.join(", ")}`);
    lines.push("");
  }
}

// 7) Append anomalies for engineering follow-up (not part of the active list)
if (anomalies.length) {
  lines.push(`---`);
  lines.push(`### Modules marked active but not found as routes (engineering follow-up)`);
  for (const a of anomalies) {
    lines.push(`- ${a.name}${a.route ? ` (expected route: ${a.route})` : ""}`);
  }
  lines.push("");
}

fs.writeFileSync(mdOut, lines.join("\n"), "utf8");

console.log(`JSON: ${jsonOut}`);
console.log(`Markdown: ${mdOut}`);
