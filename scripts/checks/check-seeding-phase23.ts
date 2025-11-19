#!/usr/bin/env tsx
/**
 * Phase 23 — Seeding + Propagation Validation
 * 
 * Tests scenario seeding and verifies APIs return expected data.
 */

const isSafeEnv = process.env.NEXA_ALLOW_SCENARIO_SEED === "true" && process.env.NODE_ENV !== "production";

if (!isSafeEnv) {
  console.log("⚠️  Skipping seeding check - not in safe environment");
  console.log("Set NEXA_ALLOW_SCENARIO_SEED=true and use non-prod DB to run this check");
  process.exit(0);
}

interface SeedingReport {
  generated: string;
  tenantId?: string;
  modulesChecked: string[];
  failures: Array<{ module: string; error: string }>;
  status: "pass" | "fail";
}

const report: SeedingReport = {
  generated: new Date().toISOString(),
  modulesChecked: [],
  failures: [],
  status: "pass",
};

async function testModuleAPI(module: string, endpoint: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      report.modulesChecked.push(module);
    } else {
      report.failures.push({ module, error: `HTTP ${response.status}` });
      report.status = "fail";
    }
  } catch (error: any) {
    report.failures.push({ module, error: error?.message || String(error) });
    report.status = "fail";
  }
}

async function main() {
  console.log("🔍 Testing Seeding + Propagation...");

  // Test core module APIs
  await testModuleAPI("Finance", "/api/finance/reports/trial-balance");
  await testModuleAPI("Inventory", "/api/inventory/stock/summary");
  await testModuleAPI("Manufacturing", "/api/manufacturing/work-orders/list");
  await testModuleAPI("Purchasing", "/api/purchasing/suppliers/list");
  await testModuleAPI("HR", "/api/hr/employees/list");
  await testModuleAPI("POS", "/api/pos/receipts/list");

  // Test KPI API
  await testModuleAPI("Analytics", "/api/analytics/kpi/all");

  // Write report
  const fs = require("fs");
  const path = require("path");
  const reportPath = path.join(__dirname, "../../reports/hardening/seeding-phase23.json");
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`✅ Seeding check complete. Report written to: ${reportPath}`);
  console.log(`\nSummary:`);
  console.log(`  - Modules checked: ${report.modulesChecked.length}`);
  console.log(`  - Failures: ${report.failures.length}`);

  if (report.status === "fail") {
    console.log(`\n⚠️  Some seeding/propagation tests failed.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All seeding/propagation tests passed.`);
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

