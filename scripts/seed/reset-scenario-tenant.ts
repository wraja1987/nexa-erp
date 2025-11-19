#!/usr/bin/env tsx
/**
 * Reset Scenario Tenant Script
 *
 * Resets a single scenario tenant by deleting seedable data (idempotent).
 * Does NOT delete Tenant, User, Account, or Entity rows.
 *
 * SAFETY GUARDS:
 * - Requires NEXA_ALLOW_SCENARIO_RESET=true
 * - Refuses to run if DATABASE_URL points to production
 * - Requires NODE_ENV !== "production"
 *
 * Usage:
 *   NEXA_ALLOW_SCENARIO_RESET=true tsx scripts/seed/reset-scenario-tenant.ts manufacturing
 *   NEXA_ALLOW_SCENARIO_RESET=true tsx scripts/seed/reset-scenario-tenant.ts retail --reseed
 */

/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import type { ScenarioKey } from "@/server/seeding/seedHelpers";
import { ensureScenarioTenant, getScenarioConfig } from "@/server/seeding/seedHelpers";

const prisma = new PrismaClient();

// Safety guards (same as seeding)
if (process.env.NEXA_ALLOW_SCENARIO_RESET !== "true") {
  console.error("❌ NEXA_ALLOW_SCENARIO_RESET is not set to 'true'");
  console.error("   This script requires explicit permission to run.");
  console.error("   Set: export NEXA_ALLOW_SCENARIO_RESET=true");
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL || "";
const prodMarkers = ["production", "prod", "prd", "live", "main", "nexa-erp-prod"];
const isProduction = prodMarkers.some((marker) => dbUrl.toLowerCase().includes(marker));

if (isProduction) {
  console.error("❌ DATABASE_URL appears to point to production!");
  console.error("   This script must NOT run against production.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  console.error("❌ NODE_ENV is set to 'production'");
  console.error("   This script must NOT run in production environment.");
  process.exit(1);
}

async function resetScenarioTenant(scenarioKey: ScenarioKey, reseed: boolean = false) {
  console.log(`🔄 Resetting scenario tenant: ${scenarioKey}`);
  console.log("");

  const config = getScenarioConfig(scenarioKey);
  const { tenantId } = await ensureScenarioTenant(prisma, scenarioKey);

  console.log(`📋 Tenant ID: ${tenantId}`);
  console.log(`📋 Tenant Name: ${config.name}`);
  console.log("");

  // Delete seedable data (in dependency order)
  console.log("🗑️  Deleting seedable data...");

  // Payments first (depend on invoices/bills)
  const paymentsDeleted = await prisma.customerPayment.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Customer payments: ${paymentsDeleted.count} deleted`);

  const supplierPaymentsDeleted = await prisma.supplierPayment.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Supplier payments: ${supplierPaymentsDeleted.count} deleted`);

  // Invoices and bills
  const invoicesDeleted = await prisma.customerInvoice.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Customer invoices: ${invoicesDeleted.count} deleted`);

  const billsDeleted = await prisma.supplierBill.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Supplier bills: ${billsDeleted.count} deleted`);

  // Journal entries and lines
  const journalLinesDeleted = await prisma.journalLine.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Journal lines: ${journalLinesDeleted.count} deleted`);

  const journalEntriesDeleted = await prisma.journalEntry.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Journal entries: ${journalEntriesDeleted.count} deleted`);

  // POS data
  const posRefundsDeleted = await prisma.posRefund.deleteMany({ where: { tenantId } });
  console.log(`   ✅ POS refunds: ${posRefundsDeleted.count} deleted`);

  const posPaymentsDeleted = await prisma.posPayment.deleteMany({ where: { tenantId } });
  console.log(`   ✅ POS payments: ${posPaymentsDeleted.count} deleted`);

  const posLinesDeleted = await prisma.posLine.deleteMany({ where: { tenantId } });
  console.log(`   ✅ POS lines: ${posLinesDeleted.count} deleted`);

  const posEventsDeleted = await prisma.posEvent.deleteMany({ where: { tenantId } });
  console.log(`   ✅ POS events: ${posEventsDeleted.count} deleted`);

  const posSalesDeleted = await prisma.posSale.deleteMany({ where: { tenantId } });
  console.log(`   ✅ POS sales: ${posSalesDeleted.count} deleted`);

  const tillShiftsDeleted = await prisma.tillShift.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Till shifts: ${tillShiftsDeleted.count} deleted`);

  const storesDeleted = await prisma.store.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Stores: ${storesDeleted.count} deleted`);

  // Manufacturing
  const routingStepsDeleted = await prisma.routingStep.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Routing steps: ${routingStepsDeleted.count} deleted`);

  const workOrdersDeleted = await prisma.workOrder.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Work orders: ${workOrdersDeleted.count} deleted`);

  const bomItemsDeleted = await prisma.bomItem.deleteMany({ where: { tenantId } });
  console.log(`   ✅ BOM items: ${bomItemsDeleted.count} deleted`);

  // Purchasing
  const poLinesDeleted = await prisma.poLine.deleteMany({ where: { tenantId } });
  console.log(`   ✅ PO lines: ${poLinesDeleted.count} deleted`);

  const purchaseOrdersDeleted = await prisma.purchaseOrder.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Purchase orders: ${purchaseOrdersDeleted.count} deleted`);

  const suppliersDeleted = await prisma.supplier.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Suppliers: ${suppliersDeleted.count} deleted`);

  // Inventory
  const inventoryLotsDeleted = await prisma.inventoryLot.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Inventory lots: ${inventoryLotsDeleted.count} deleted`);

  const inventoryItemsDeleted = await prisma.inventoryItem.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Inventory items: ${inventoryItemsDeleted.count} deleted`);

  const locationsDeleted = await prisma.location.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Locations: ${locationsDeleted.count} deleted`);

  const warehousesDeleted = await prisma.warehouse.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Warehouses: ${warehousesDeleted.count} deleted`);

  // HR/Payroll
  const allowancesDeleted = await prisma.allowance.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Allowances: ${allowancesDeleted.count} deleted`);

  const deductionsDeleted = await prisma.deduction.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Deductions: ${deductionsDeleted.count} deleted`);

  const payslipsDeleted = await prisma.payslip.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Payslips: ${payslipsDeleted.count} deleted`);

  const payrollRunsDeleted = await prisma.payrollRun.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Payroll runs: ${payrollRunsDeleted.count} deleted`);

  const paySchedulesDeleted = await prisma.paySchedule.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Pay schedules: ${paySchedulesDeleted.count} deleted`);

  const employeesDeleted = await prisma.employee.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Employees: ${employeesDeleted.count} deleted`);

  // Banking
  const bankStatementLinesDeleted = await prisma.bankStatementLine.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Bank statement lines: ${bankStatementLinesDeleted.count} deleted`);

  const bankReconciliationsDeleted = await prisma.bankReconciliation.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Bank reconciliations: ${bankReconciliationsDeleted.count} deleted`);

  const bankAccountsDeleted = await prisma.bankAccount.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Bank accounts: ${bankAccountsDeleted.count} deleted`);

  // Analytics
  const kpiSnapshotsDeleted = await prisma.kpiSnapshot.deleteMany({ where: { tenantId } });
  console.log(`   ✅ KPI snapshots: ${kpiSnapshotsDeleted.count} deleted`);

  // Fixed assets
  const depreciationSchedulesDeleted = await prisma.depreciationSchedule.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Depreciation schedules: ${depreciationSchedulesDeleted.count} deleted`);

  const fixedAssetDisposalsDeleted = await prisma.fixedAssetDisposal.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Fixed asset disposals: ${fixedAssetDisposalsDeleted.count} deleted`);

  const fixedAssetsDeleted = await prisma.fixedAsset.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Fixed assets: ${fixedAssetsDeleted.count} deleted`);

  // Treasury movements
  const treasuryMovementsDeleted = await prisma.treasuryMovement.deleteMany({ where: { tenantId } });
  console.log(`   ✅ Treasury movements: ${treasuryMovementsDeleted.count} deleted`);

  console.log("");
  console.log(`✅ Reset complete for tenant: ${config.name}`);

  // Optionally reseed
  if (reseed) {
    console.log("");
    console.log("🌱 Re-seeding scenario...");
    const scenarioScripts: Record<ScenarioKey, () => Promise<void>> = {
      manufacturing: async () => {
        const { seedManufacturingScenario } = await import("./seed-scenario-manufacturing");
        await seedManufacturingScenario(prisma);
      },
      retail: async () => {
        const { seedRetailScenario } = await import("./seed-scenario-retail");
        await seedRetailScenario(prisma);
      },
      consulting: async () => {
        const { seedConsultingScenario } = await import("./seed-scenario-consulting");
        await seedConsultingScenario(prisma);
      },
      healthcare: async () => {
        const { seedHealthcareScenario } = await import("./seed-scenario-healthcare");
        await seedHealthcareScenario(prisma);
      },
    };

    const seedFn = scenarioScripts[scenarioKey];
    if (seedFn) {
      await seedFn();
      console.log(`✅ Re-seed complete`);
    } else {
      console.error(`❌ Unknown scenario: ${scenarioKey}`);
    }
  }
}

async function main() {
  const scenarioKey = process.argv[2] as ScenarioKey | undefined;
  const reseed = process.argv.includes("--reseed");

  if (!scenarioKey || !["manufacturing", "retail", "consulting", "healthcare"].includes(scenarioKey)) {
    console.error("❌ Usage: tsx scripts/seed/reset-scenario-tenant.ts <scenario> [--reseed]");
    console.error("   Scenarios: manufacturing, retail, consulting, healthcare");
    process.exit(1);
  }

  try {
    await resetScenarioTenant(scenarioKey, reseed);
  } catch (error: any) {
    console.error(`❌ Error resetting scenario tenant:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

