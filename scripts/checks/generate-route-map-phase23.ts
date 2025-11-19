#!/usr/bin/env tsx
/**
 * Phase 23 — Route Map Generator
 * 
 * Generates a comprehensive route map with nav entries and permissions.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, relative } from "path";

const ROOT = join(__dirname, "../..");
const WEB_ROOT = join(ROOT, "apps/web");
const APP_DIR = join(WEB_ROOT, "app/(app)");
const NAV_FILE = join(WEB_ROOT, "src/config/nav.ts");

interface RouteInfo {
  route: string;
  inNav: boolean;
  navLabel?: string;
  permission?: string;
  file: string;
}

interface RouteMap {
  generated: string;
  totalRoutes: number;
  routes: RouteInfo[];
}

function collectRoutes(dir: string, basePath: string = ""): Array<{ route: string; file: string }> {
  const routes: Array<{ route: string; file: string }> = [];
  
  if (!existsSync(dir)) return routes;
  
  const entries = require("fs").readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = join(basePath, entry.name);
    
    if (entry.isDirectory()) {
      routes.push(...collectRoutes(fullPath, relativePath));
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      const route = relativePath.replace(/\/page\.tsx?$/, "") || "/";
      routes.push({ route: `/${route}`, file: fullPath });
    }
  }
  
  return routes;
}

function loadNavRoutes(): Map<string, { label: string; permission?: string }> {
  const navMap = new Map();
  
  if (!existsSync(NAV_FILE)) return navMap;
  
  const navContent = readFileSync(NAV_FILE, "utf-8");
  
  // Extract routes and their labels/permissions
  const itemRegex = /href:\s*["']([^"']+)["'][^}]*label:\s*["']([^"']+)["'][^}]*requiredPermission[:\s]*["']([^"']+)["']?/g;
  let match;
  while ((match = itemRegex.exec(navContent)) !== null) {
    navMap.set(match[1], { label: match[2], permission: match[3] });
  }
  
  // Also match items without permissions
  const simpleRegex = /href:\s*["']([^"']+)["'][^}]*label:\s*["']([^"']+)["']/g;
  while ((match = simpleRegex.exec(navContent)) !== null) {
    if (!navMap.has(match[1])) {
      navMap.set(match[1], { label: match[2] });
    }
  }
  
  return navMap;
}

async function main() {
  console.log("🔍 Generating route map...");

  const routes = collectRoutes(APP_DIR);
  const navMap = loadNavRoutes();
  
  const routeMap: RouteMap = {
    generated: new Date().toISOString(),
    totalRoutes: routes.length,
    routes: routes.map((r) => {
      const navInfo = navMap.get(r.route);
      return {
        route: r.route,
        inNav: !!navInfo,
        navLabel: navInfo?.label,
        permission: navInfo?.permission,
        file: relative(ROOT, r.file),
      };
    }),
  };

  // Write JSON report
  const reportPath = join(ROOT, "reports/hardening/route-map-phase23.json");
  const reportDir = join(ROOT, "reports/hardening");

  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }

  writeFileSync(reportPath, JSON.stringify(routeMap, null, 2));

  // Write Markdown summary
  const mdPath = join(ROOT, "reports/hardening/route-map-phase23.md");
  let md = `# Route Map — Phase 23\n\n`;
  md += `**Generated**: ${routeMap.generated}\n\n`;
  md += `**Total Routes**: ${routeMap.totalRoutes}\n\n`;
  md += `## Routes\n\n`;
  md += `| Route | In Nav | Nav Label | Permission | File |\n`;
  md += `|-------|--------|-----------|------------|------|\n`;

  for (const route of routeMap.routes) {
    md += `| ${route.route} | ${route.inNav ? "✅" : "❌"} | ${route.navLabel || "—"} | ${route.permission || "—"} | ${route.file} |\n`;
  }

  writeFileSync(mdPath, md);

  console.log(`✅ Route map generated.`);
  console.log(`  - JSON: ${relative(ROOT, reportPath)}`);
  console.log(`  - Markdown: ${relative(ROOT, mdPath)}`);
  console.log(`\nSummary:`);
  const inNav = routeMap.routes.filter((r) => r.inNav).length;
  const notInNav = routeMap.routes.filter((r) => !r.inNav).length;
  console.log(`  - Routes in nav: ${inNav}`);
  console.log(`  - Routes not in nav: ${notInNav}`);

  process.exit(0);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

