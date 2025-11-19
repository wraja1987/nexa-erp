#!/usr/bin/env tsx
/**
 * Runtime smoke test script for all Task-8 modules.
 * Tests key endpoints from each module to ensure they respond correctly.
 *
 * Usage:
 *   RUNTIME_SMOKE_BASE_URL=https://staging.nexaai.co.uk tsx scripts/runtime/runtime-smoke.ts
 */

const BASE_URL = process.env.RUNTIME_SMOKE_BASE_URL || "http://localhost:3000";

interface SmokeTest {
  name: string;
  path: string;
  expectedStatus: number | number[]; // Allow multiple acceptable status codes
  method?: "GET" | "POST";
  requiresAuth?: boolean;
}

const tests: SmokeTest[] = [
  // Health endpoints
  { name: "Health check", path: "/api/health", expectedStatus: 200 },
  { name: "Status check", path: "/api/status", expectedStatus: 200 },

  // Finance
  { name: "Finance P&L report", path: "/api/finance/reports/pnl", expectedStatus: [200, 401, 403] },
  { name: "Finance balance sheet", path: "/api/finance/reports/balance-sheet", expectedStatus: [200, 401, 403] },
  { name: "Finance receivables ageing", path: "/api/finance/reports/ap-ar/receivables-aging", expectedStatus: [200, 401, 403] },

  // Banking
  { name: "Banking accounts list", path: "/api/banking/accounts/list", expectedStatus: [200, 401, 403] },

  // HR/Payroll
  { name: "HR employees list", path: "/api/hr/employees/list", expectedStatus: [200, 401, 403] },
  { name: "HR payroll runs list", path: "/api/hr/payroll/runs/list", expectedStatus: [200, 401, 403] },

  // Inventory/WMS
  { name: "Inventory stock summary", path: "/api/inventory/stock/summary", expectedStatus: [200, 401, 403] },
  { name: "Inventory items list", path: "/api/inventory/items/list", expectedStatus: [200, 401, 403] },

  // Manufacturing
  { name: "Manufacturing workorders list", path: "/api/manufacturing/workorders/list", expectedStatus: [200, 401, 403] },

  // Purchasing
  { name: "Purchasing PO list", path: "/api/purchasing/po/list", expectedStatus: [200, 401, 403] },

  // Projects
  { name: "Projects list", path: "/api/projects/projects/list", expectedStatus: [200, 401, 403] },

  // Sales/CRM
  { name: "Sales orders list", path: "/api/sales/orders/list", expectedStatus: [200, 401, 403] },
  { name: "CRM accounts list", path: "/api/crm/accounts/list", expectedStatus: [200, 401, 403] },

  // POS
  { name: "POS sessions list", path: "/api/pos/sessions/list", expectedStatus: [200, 401, 403] },

  // Tax
  { name: "Tax VAT summary", path: "/api/tax/vat/summary", expectedStatus: [200, 401, 403] },

  // Analytics
  { name: "Analytics KPI all", path: "/api/analytics/kpi/all", expectedStatus: [200, 401, 403] },

  // AI Engine
  { name: "AI management commentary", path: "/api/ai/management/commentary", expectedStatus: [200, 401, 403] },

  // Admin/Partner
  { name: "Admin CoA templates list", path: "/api/admin/coa-templates/list", expectedStatus: [200, 401, 403] },
  { name: "Partner partners list", path: "/api/partner/partners/list", expectedStatus: [200, 401, 403] },

  // Healthcare
  { name: "Healthcare reports overview", path: "/api/healthcare/reports/overview", expectedStatus: [200, 401, 403] },
];

async function runSmokeTest(test: SmokeTest): Promise<{ passed: boolean; status: number; error?: string }> {
  const url = `${BASE_URL}${test.path}`;
  const method = test.method || "GET";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const status = response.status;
    const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
    const passed = expectedStatuses.includes(status);

    if (!passed) {
      const text = await response.text().catch(() => "");
      return {
        passed: false,
        status,
        error: `Expected one of ${expectedStatuses.join(", ")}, got ${status}. Response: ${text.slice(0, 200)}`,
      };
    }

    return { passed: true, status };
  } catch (error: any) {
    return {
      passed: false,
      status: 0,
      error: `Request failed: ${error?.message || String(error)}`,
    };
  }
}

async function main() {
  console.log(`🚀 Running runtime smoke tests against: ${BASE_URL}\n`);

  const results: Array<{ test: SmokeTest; result: { passed: boolean; status: number; error?: string } }> = [];

  for (const test of tests) {
    const result = await runSmokeTest(test);
    results.push({ test, result });

    const icon = result.passed ? "✅" : "❌";
    const statusText = result.passed ? `OK (${result.status})` : `FAIL (${result.status})`;
    console.log(`${icon} ${test.name}: ${statusText}`);
    if (result.error) {
      console.log(`   ${result.error}`);
    }
  }

  const passed = results.filter((r) => r.result.passed).length;
  const failed = results.filter((r) => !r.result.passed).length;

  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed out of ${results.length} tests`);

  if (failed > 0) {
    console.error("\n❌ Some smoke tests failed. Check the output above for details.");
    process.exit(1);
  } else {
    console.log("\n✅ All smoke tests passed!");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

