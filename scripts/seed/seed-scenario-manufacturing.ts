#!/usr/bin/env tsx
/**
 * Manufacturing Scenario Seed Script
 *
 * Seeds:
 * - Finance (CoA, opening balances, invoices, payments, GL entries)
 * - Banking (accounts, statements)
 * - Inventory/WMS (warehouses, bins, items, stock, transfers)
 * - Manufacturing (BOMs, WorkOrders)
 * - Purchasing (suppliers, POs)
 * - HR/Payroll (employees, payroll runs)
 */

/* eslint-disable no-console */
import { PrismaClient, Prisma } from "@prisma/client";
import { runScenarioSeed } from "./seed-scenario-base";
import {
  ensureScenarioTenant,
  ensureScenarioUser,
  seedAccountsIfEmpty,
  seedOpeningBalancesIfEmpty,
  seedSuppliersIfEmpty,
  seedWarehousesIfEmpty,
  seedLocationsIfEmpty,
  seedInventoryItemsIfEmpty,
  seedInventoryLotsIfEmpty,
  seedEmployeesIfEmpty,
  seedBankAccountsIfEmpty,
  getScenarioConfig,
} from "@/server/seeding/seedHelpers";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { FinanceInvoiceCreated, InventoryTransferCreated, PurchasingPoApproved } from "@/server/events/types";

export async function seedManufacturingScenario(prisma: PrismaClient) {
  const config = getScenarioConfig("manufacturing");
  console.log(`📦 Manufacturing Scenario: ${config.name}`);

  // 1. Ensure tenant and user
  const { tenantId, entityId } = await ensureScenarioTenant(prisma, "manufacturing");
  console.log(`✅ Tenant: ${tenantId}`);
  await ensureScenarioUser(prisma, tenantId, config.defaultUserEmail, config.defaultUserRole, config.defaultUserPassword);
  console.log(`✅ User: ${config.defaultUserEmail}`);

  // 2. Seed CoA and opening balances
  const { accountsCreated } = await seedAccountsIfEmpty(prisma, tenantId, "manufacturing");
  console.log(`✅ Accounts: ${accountsCreated} created`);
  const { entriesCreated } = await seedOpeningBalancesIfEmpty(prisma, tenantId, "manufacturing");
  console.log(`✅ Opening balances: ${entriesCreated} entries`);

  // 3. Seed suppliers
  const { suppliersCreated } = await seedSuppliersIfEmpty(prisma, tenantId, "manufacturing", [
    "SUP-RM-001",
    "SUP-RM-002",
    "SUP-MFG-001",
  ]);
  console.log(`✅ Suppliers: ${suppliersCreated} created`);

  // 4. Seed warehouses and locations
  const { warehousesCreated, warehouseIds } = await seedWarehousesIfEmpty(prisma, tenantId, [
    { code: "MFG-WH-01", name: "Raw Materials Warehouse" },
    { code: "MFG-WH-02", name: "Finished Goods Warehouse" },
  ]);
  console.log(`✅ Warehouses: ${warehousesCreated} created`);

  const wh01Locations = await seedLocationsIfEmpty(prisma, tenantId, warehouseIds["MFG-WH-01"], [
    { code: "RM-BIN-01", type: "raw_materials" },
    { code: "RM-BIN-02", type: "raw_materials" },
  ]);
  const wh02Locations = await seedLocationsIfEmpty(prisma, tenantId, warehouseIds["MFG-WH-02"], [
    { code: "FG-BIN-01", type: "finished_goods" },
    { code: "FG-BIN-02", type: "finished_goods" },
  ]);
  console.log(`✅ Locations: ${wh01Locations.locationsCreated + wh02Locations.locationsCreated} created`);

  // 5. Seed inventory items
  const { itemsCreated } = await seedInventoryItemsIfEmpty(prisma, tenantId, [
    { sku: "RM-STEEL", warehouseId: warehouseIds["MFG-WH-01"], locationId: wh01Locations.locationIds["RM-BIN-01"], qtyOnHand: 1000 },
    { sku: "RM-PLASTIC", warehouseId: warehouseIds["MFG-WH-01"], locationId: wh01Locations.locationIds["RM-BIN-02"], qtyOnHand: 500 },
    { sku: "FG-PUMP", warehouseId: warehouseIds["MFG-WH-02"], locationId: wh02Locations.locationIds["FG-BIN-01"], qtyOnHand: 50 },
    { sku: "FG-MOTOR", warehouseId: warehouseIds["MFG-WH-02"], locationId: wh02Locations.locationIds["FG-BIN-02"], qtyOnHand: 30 },
  ]);
  console.log(`✅ Inventory items: ${itemsCreated} created`);

  // 6. Seed inventory lots
  const { lotsCreated } = await seedInventoryLotsIfEmpty(prisma, tenantId, [
    { sku: "RM-STEEL", qty: 1000, unitCost: 10, warehouseId: warehouseIds["MFG-WH-01"], locationId: wh01Locations.locationIds["RM-BIN-01"] },
    { sku: "RM-PLASTIC", qty: 500, unitCost: 5, warehouseId: warehouseIds["MFG-WH-01"], locationId: wh01Locations.locationIds["RM-BIN-02"] },
    { sku: "FG-PUMP", qty: 50, unitCost: 100, warehouseId: warehouseIds["MFG-WH-02"], locationId: wh02Locations.locationIds["FG-BIN-01"] },
    { sku: "FG-MOTOR", qty: 30, unitCost: 150, warehouseId: warehouseIds["MFG-WH-02"], locationId: wh02Locations.locationIds["FG-BIN-02"] },
  ]);
  console.log(`✅ Inventory lots: ${lotsCreated} created`);

  // 7. Seed BOMs
  const bomCount = await prisma.bomItem.count({ where: { tenantId } });
  if (bomCount === 0) {
    await prisma.bomItem.createMany({
      data: [
        { tenantId, parentItemCode: "FG-PUMP", componentItemCode: "RM-STEEL", quantity: new Prisma.Decimal(2) },
        { tenantId, parentItemCode: "FG-PUMP", componentItemCode: "RM-PLASTIC", quantity: new Prisma.Decimal(1) },
        { tenantId, parentItemCode: "FG-MOTOR", componentItemCode: "RM-STEEL", quantity: new Prisma.Decimal(3) },
        { tenantId, parentItemCode: "FG-MOTOR", componentItemCode: "RM-PLASTIC", quantity: new Prisma.Decimal(2) },
      ],
    });
    console.log(`✅ BOMs: 4 created`);
  } else {
    console.log(`✅ BOMs: ${bomCount} already exist`);
  }

  // 8. Seed work orders
  const woCount = await prisma.workOrder.count({ where: { tenantId } });
  if (woCount === 0) {
    const wo1 = await prisma.workOrder.create({
      data: {
        tenantId,
        number: "WO-MFG-001",
        itemCode: "FG-PUMP",
        quantity: new Prisma.Decimal(10),
        status: "planned",
        startPlanned: new Date(),
        endPlanned: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    const wo2 = await prisma.workOrder.create({
      data: {
        tenantId,
        number: "WO-MFG-002",
        itemCode: "FG-MOTOR",
        quantity: new Prisma.Decimal(5),
        status: "released",
        startPlanned: new Date(),
        endPlanned: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        startActual: new Date(),
      },
    });
    const wo3 = await prisma.workOrder.create({
      data: {
        tenantId,
        number: "WO-MFG-003",
        itemCode: "FG-PUMP",
        quantity: new Prisma.Decimal(20),
        status: "completed",
        startPlanned: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endPlanned: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        startActual: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endActual: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Add routing steps
    await prisma.routingStep.createMany({
      data: [
        { tenantId, workOrderId: wo1.id, seq: 1, resourceCode: "MACHINE-01", durationMins: 60, status: "pending" },
        { tenantId, workOrderId: wo2.id, seq: 1, resourceCode: "MACHINE-02", durationMins: 90, status: "in_progress" },
        { tenantId, workOrderId: wo3.id, seq: 1, resourceCode: "MACHINE-01", durationMins: 120, status: "done" },
      ],
    });

    console.log(`✅ Work orders: 3 created`);
  } else {
    console.log(`✅ Work orders: ${woCount} already exist`);
  }

  // 9. Seed purchase orders
  const suppliers = await prisma.supplier.findMany({ where: { tenantId } });
  if (suppliers.length > 0) {
    const poCount = await prisma.purchaseOrder.count({ where: { tenantId } });
    if (poCount === 0) {
      const po1 = await prisma.purchaseOrder.create({
        data: {
          tenantId,
          supplierId: suppliers[0].id,
          number: "PO-MFG-001",
          currency: "GBP",
          status: "draft",
          lines: {
            create: [
              { tenantId, lineNo: 1, sku: "RM-STEEL", qty: new Prisma.Decimal(500), price: new Prisma.Decimal(10) },
            ],
          },
        },
      });

      const po2 = await prisma.purchaseOrder.create({
        data: {
          tenantId,
          supplierId: suppliers[1]?.id || suppliers[0].id,
          number: "PO-MFG-002",
          currency: "GBP",
          status: "approved",
          lines: {
            create: [
              { tenantId, lineNo: 1, sku: "RM-PLASTIC", qty: new Prisma.Decimal(200), price: new Prisma.Decimal(5) },
            ],
          },
        },
      });

      // Publish event for approved PO
      try {
        const event: PurchasingPoApproved = {
          id: newEventId(),
          tenantId,
          type: "purchasing.po.approved",
          occurredAt: nowIso(),
          source: "purchasing.po",
          version: 1,
          payload: {
            poId: po2.id,
            number: po2.number,
            supplierCode: suppliers[1]?.code || suppliers[0].code,
            totalMinor: 1000 * 100,
            currencyCode: "GBP",
            approvedAt: nowIso(),
          },
        };
        await publishWithOutbox(event);
      } catch (error) {
        console.warn(`[Seed] Failed to publish PO approved event:`, error);
      }

      console.log(`✅ Purchase orders: 2 created`);
    } else {
      console.log(`✅ Purchase orders: ${poCount} already exist`);
    }
  }

  // 10. Seed customer invoices
  const invoiceCount = await prisma.customerInvoice.count({ where: { tenantId } });
  if (invoiceCount === 0) {
    const inv1 = await prisma.customerInvoice.create({
      data: {
        tenantId,
        number: "INV-MFG-001",
        customerId: "CUST-MFG-001",
        currency: "GBP",
        total: new Prisma.Decimal(5000),
        status: "draft",
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const inv2 = await prisma.customerInvoice.create({
      data: {
        tenantId,
        number: "INV-MFG-002",
        customerId: "CUST-MFG-002",
        currency: "GBP",
        total: new Prisma.Decimal(7500),
        status: "approved",
        issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dueAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      },
    });

    // Publish event for approved invoice
    try {
      const event: FinanceInvoiceCreated = {
        id: newEventId(),
        tenantId,
        type: "finance.invoice.created",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: inv2.id,
          number: inv2.number,
          totalMinor: Number(inv2.total) * 100,
          currencyCode: inv2.currency,
          issuedAt: inv2.issuedAt.toISOString(),
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[Seed] Failed to publish invoice created event:`, error);
    }

    // Add payment for approved invoice
    await prisma.customerPayment.create({
      data: {
        tenantId,
        invoiceId: inv2.id,
        amount: new Prisma.Decimal(7500),
        method: "bank_transfer",
        reference: "PAY-MFG-001",
      },
    });

    console.log(`✅ Customer invoices: 2 created, 1 payment`);
  } else {
    console.log(`✅ Customer invoices: ${invoiceCount} already exist`);
  }

  // 11. Seed bank accounts
  const { accountsCreated: bankAccountsCreated, accountIds } = await seedBankAccountsIfEmpty(prisma, tenantId, [
    { code: "BANK-001", name: "Main Operating Account", currency: "GBP" },
  ]);
  console.log(`✅ Bank accounts: ${bankAccountsCreated} created`);

  // 12. Seed bank statement lines
  if (Object.keys(accountIds).length > 0) {
    const statementCount = await prisma.bankStatementLine.count({ where: { tenantId } });
    if (statementCount === 0) {
      await prisma.bankStatementLine.createMany({
        data: [
          {
            tenantId,
            bankAccountId: accountIds["BANK-001"],
            date: new Date(),
            description: "Customer payment",
            amount: new Prisma.Decimal(7500),
            reference: "PAY-MFG-001",
          },
          {
            tenantId,
            bankAccountId: accountIds["BANK-001"],
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            description: "Supplier payment",
            amount: new Prisma.Decimal(-1000),
            reference: "PO-MFG-002",
          },
        ],
      });
      console.log(`✅ Bank statement lines: 2 created`);
    } else {
      console.log(`✅ Bank statement lines: ${statementCount} already exist`);
    }
  }

  // 13. Seed employees and payroll
  const { employeesCreated, employeeIds } = await seedEmployeesIfEmpty(prisma, tenantId, [
    { empNo: "EMP-MFG-001", firstName: "John", lastName: "Smith", email: "john.smith@manufacturing.nexa.demo" },
    { empNo: "EMP-MFG-002", firstName: "Jane", lastName: "Doe", email: "jane.doe@manufacturing.nexa.demo" },
  ]);
  console.log(`✅ Employees: ${employeesCreated} created`);

  if (Object.keys(employeeIds).length > 0) {
    const payrollCount = await prisma.payrollRun.count({ where: { tenantId } });
    if (payrollCount === 0) {
      const schedule = await prisma.paySchedule.create({
        data: {
          tenantId,
          name: "Monthly",
          frequency: "monthly",
        },
      });

      const run = await prisma.payrollRun.create({
        data: {
          tenantId,
          scheduleId: schedule.id,
          periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          status: "posted",
        },
      });

      await prisma.payslip.createMany({
        data: [
          {
            tenantId,
            runId: run.id,
            employeeId: employeeIds["EMP-MFG-001"],
            grossPay: new Prisma.Decimal(3000),
            netPay: new Prisma.Decimal(2400),
          },
          {
            tenantId,
            runId: run.id,
            employeeId: employeeIds["EMP-MFG-002"],
            grossPay: new Prisma.Decimal(3200),
            netPay: new Prisma.Decimal(2560),
          },
        ],
      });

      console.log(`✅ Payroll: 1 run, 2 payslips`);
    } else {
      console.log(`✅ Payroll: ${payrollCount} runs already exist`);
    }
  }

  // 14. Seed KPI snapshots
  const kpiCount = await prisma.kpiSnapshot.count({ where: { tenantId } });
  if (kpiCount === 0) {
    await prisma.kpiSnapshot.createMany({
      data: [
        { tenantId, name: "revenue", value: new Prisma.Decimal(12500), asOf: new Date() },
        { tenantId, name: "inventory_value", value: new Prisma.Decimal(12500), asOf: new Date() },
        { tenantId, name: "employees", value: new Prisma.Decimal(2), asOf: new Date() },
      ],
    });
    console.log(`✅ KPI snapshots: 3 created`);
  } else {
    console.log(`✅ KPI snapshots: ${kpiCount} already exist`);
  }

  console.log("");
  console.log(`✅ Manufacturing scenario seed complete!`);
}

if (require.main === module) {
  runScenarioSeed("manufacturing", seedManufacturingScenario).catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

