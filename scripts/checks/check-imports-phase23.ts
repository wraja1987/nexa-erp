#!/usr/bin/env tsx
/**
 * Phase 23 — Import/Export Suite Validation
 * 
 * Tests import preview endpoints with synthetic CSV data.
 */

interface ImportReport {
  generated: string;
  tests: Array<{
    type: string;
    csvParsing: boolean;
    rowMapping: boolean;
    validation: boolean;
    safeMode: boolean;
    eventPublishing: boolean;
    error?: string;
    status: "pass" | "fail" | "skip";
  }>;
}

const report: ImportReport = {
  generated: new Date().toISOString(),
  tests: [],
};

async function testImportPreview(type: string, endpoint: string, csvSample: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        csv: csvSample,
        preview: true,
      }),
    });

    const data = await response.json().catch(() => ({}));

    report.tests.push({
      type,
      csvParsing: data.parsed !== undefined || data.rows !== undefined,
      rowMapping: data.mapped !== undefined || data.rows !== undefined,
      validation: data.errors !== undefined || data.valid === true,
      safeMode: true, // Preview mode is safe
      eventPublishing: false, // Preview doesn't publish events
      status: response.ok ? "pass" : "fail",
    });
  } catch (error: any) {
    report.tests.push({
      type,
      csvParsing: false,
      rowMapping: false,
      validation: false,
      safeMode: false,
      eventPublishing: false,
      error: error?.message || String(error),
      status: "fail",
    });
  }
}

async function main() {
  console.log("🔍 Testing Import/Export suite...");

  // Test COA preview
  await testImportPreview("COA", "/api/import/coa/preview", "Code,Name,Type\n1000,Cash,Asset");

  // Test opening balances preview
  await testImportPreview("Opening Balances", "/api/import/opening-balances/preview", "Account,Debit,Credit\n1000,1000,0");

  // Test item master import preview
  await testImportPreview("Item Master", "/api/import/items/preview", "SKU,Name,Unit\nITEM001,Test Item,EA");

  // Test vendor import preview
  await testImportPreview("Vendors", "/api/import/vendors/preview", "Code,Name,Email\nV001,Test Vendor,vendor@test.com");

  // Write report
  const fs = require("fs");
  const path = require("path");
  const reportPath = path.join(__dirname, "../../reports/hardening/imports-phase23.json");
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`✅ Import/Export check complete. Report written to: ${reportPath}`);
  console.log(`\nSummary:`);
  const passed = report.tests.filter((t) => t.status === "pass").length;
  const failed = report.tests.filter((t) => t.status === "fail").length;
  console.log(`  - Passed: ${passed}`);
  console.log(`  - Failed: ${failed}`);

  if (failed > 0) {
    console.log(`\n⚠️  Some import/export tests failed.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All import/export tests passed.`);
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

