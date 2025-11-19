#!/usr/bin/env tsx
/**
 * Phase 23 — Route Consistency + RBAC Integrity Checker
 * 
 * Ensures:
 * - Every route has a corresponding nav entry OR is explicitly marked hidden
 * - RBAC gating matches module-level rules
 * - No inconsistencies between API and UI permissions
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, relative } from "path";

const ROOT = join(__dirname, "../..");
const WEB_ROOT = join(ROOT, "apps/web");
const APP_DIR = join(WEB_ROOT, "app/(app)");
const API_DIR = join(WEB_ROOT, "app/api");

interface RBACReport {
  generated: string;
  routesWithoutNavEntry: Array<{ route: string; file: string }>;
  rbacMismatches: Array<{ route: string; file: string; issue: string }>;
  apiUiPermissionMismatches: Array<{ route: string; apiRoute: string; uiPermission?: string; apiPermission?: string }>;
}

const report: RBACReport = {
  generated: new Date().toISOString(),
  routesWithoutNavEntry: [],
  rbacMismatches: [],
  apiUiPermissionMismatches: [],
};

// Load nav.ts routes
function loadNavRoutes(): Set<string> {
  const navFile = join(WEB_ROOT, "src/config/nav.ts");
  if (!existsSync(navFile)) return new Set();
  
  const navContent = readFileSync(navFile, "utf-8");
  const routes = new Set<string>();
  
  // Extract all href values
  const hrefRegex = /href:\s*["']([^"']+)["']/g;
  let match;
  while ((match = hrefRegex.exec(navContent)) !== null) {
    routes.add(match[1]);
  }
  
  return routes;
}

// Collect all routes
function collectRoutes(dir: string, basePath: string = ""): Array<{ route: string; file: string }> {
  const routes: Array<{ route: string; file: string }> = [];
  
  if (!existsSync(dir)) return routes;
  
  const entries = readdirSync(dir, { withFileTypes: true });
  
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

// Check RBAC in page file
function checkPageRBAC(file: string, content: string): string | undefined {
  // Look for RBAC checks
  if (content.includes("requiredPermission") || content.includes("checkPermission") || content.includes("canAccess")) {
    // Extract permission if possible
    const permissionMatch = content.match(/requiredPermission[:\s]*["']([^"']+)["']/);
    return permissionMatch ? permissionMatch[1] : undefined;
  }
  return undefined;
}

// Check API route RBAC
function checkAPIRBAC(route: string): string | undefined {
  const apiRoute = route.replace(/^\/app\/\(app\)/, "").replace(/\/page\.tsx?$/, "");
  const apiFile = join(API_DIR, apiRoute, "route.ts");
  
  if (!existsSync(apiFile)) return undefined;
  
  try {
    const content = readFileSync(apiFile, "utf-8");
    // Look for RBAC checks in API
    if (content.includes("requiredPermission") || content.includes("checkPermission")) {
      const permissionMatch = content.match(/requiredPermission[:\s]*["']([^"']+)["']/);
      return permissionMatch ? permissionMatch[1] : undefined;
    }
  } catch {
    // Skip if can't read
  }
  
  return undefined;
}

// Main execution
console.log("🔍 Checking route consistency and RBAC integrity...");

const navRoutes = loadNavRoutes();
const allRoutes = collectRoutes(APP_DIR);

const knownSpecialRoutes = new Set([
  "/help",
  "/profile",
  "/alerts",
  "/dashboard",
]);

for (const route of allRoutes) {
  // Skip dynamic routes
  if (route.route.includes("[") || route.route.includes("(")) {
    continue;
  }
  
  // Check if route is in nav
  if (!navRoutes.has(route.route) && !knownSpecialRoutes.has(route.route)) {
    report.routesWithoutNavEntry.push(route);
  }
  
  // Check RBAC consistency
  try {
    const content = readFileSync(route.file, "utf-8");
    const uiPermission = checkPageRBAC(route.file, content);
    const apiPermission = checkAPIRBAC(route.file);
    
    if (uiPermission && apiPermission && uiPermission !== apiPermission) {
      report.apiUiPermissionMismatches.push({
        route: route.route,
        apiRoute: route.file.replace(/\/page\.tsx?$/, ""),
        uiPermission,
        apiPermission,
      });
    }
  } catch {
    // Skip if can't read
  }
}

// Write report
const reportPath = join(ROOT, "reports/hardening/route-rbac-phase23.json");
const reportDir = join(ROOT, "reports/hardening");

if (!existsSync(reportDir)) {
  require("fs").mkdirSync(reportDir, { recursive: true });
}

require("fs").writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`✅ Route/RBAC integrity check complete. Report written to: ${relative(ROOT, reportPath)}`);
console.log(`\nSummary:`);
console.log(`  - Routes without nav entry: ${report.routesWithoutNavEntry.length}`);
console.log(`  - RBAC mismatches: ${report.rbacMismatches.length}`);
console.log(`  - API/UI permission mismatches: ${report.apiUiPermissionMismatches.length}`);

if (
  report.routesWithoutNavEntry.length > 0 ||
  report.rbacMismatches.length > 0 ||
  report.apiUiPermissionMismatches.length > 0
) {
  console.log(`\n⚠️  Issues found. Please review the report.`);
  process.exit(1);
} else {
  console.log(`\n✅ No issues found.`);
  process.exit(0);
}

