#!/usr/bin/env tsx
/**
 * Retail Scenario Seed Script
 *
 * Seeds:
 * - Finance (CoA, invoices, payments)
 * - Banking (accounts, statements)
 * - Inventory/WMS (warehouses, items, stock)
 * - POS (Store, TillShift, PosSale, PosPayment)
 * - Purchasing (suppliers, POs)
 * - Analytics (KPI snapshots)
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
  seedBankAccountsIfEmpty,
  getScenarioConfig,
} from "@/server/seeding/seedHelpers";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { FinanceInvoiceCreated, PurchasingPoApproved } from "@/server/events/types";

export async function seedRetailScenario(prisma: PrismaClient) {
  const config = getScenarioConfig("retail");
  console.log(`🛍️  Retail Scenario: ${config.name}`);

  const { tenantId } = await ensureScenarioTenant(prisma, "retail");
  await ensureScenarioUser(prisma, tenantId, config.defaultUserEmail, config.defaultUserRole, config.defaultUserPassword);

  await seedAccountsIfEmpty(prisma, tenantId, "retail");
  await seedOpeningBalancesIfEmpty(prisma, tenantId, "retail");

  await seedSuppliersIfEmpty(prisma, tenantId, "retail", ["SUP-RTL-001", "SUP-RTL-002"]);

  const { warehouseIds } = await seedWarehousesIfEmpty(prisma, tenantId, [
    { code: "RTL-STORE-01", name: "Main Store" },
    { code: "RTL-WH-01", name: "Warehouse" },
  ]);

  const storeLocations = await seedLocationsIfEmpty(prisma, tenantId, warehouseIds["RTL-STORE-01"], [
    { code: "FLOOR-01", type: "sales_floor" },
    { code: "BACK-01", type: "back_stock" },
  ]);

  await seedInventoryItemsIfEmpty(prisma, tenantId, [
    { sku: "SKU-TSHIRT", warehouseId: warehouseIds["RTL-STORE-01"], locationId: storeLocations.locationIds["FLOOR-01"], qtyOnHand: 100 },
    { sku: "SKU-JEANS", warehouseId: warehouseIds["RTL-STORE-01"], locationId: storeLocations.locationIds["FLOOR-01"], qtyOnHand: 50 },
    { sku: "SKU-SHOES", warehouseId: warehouseIds["RTL-STORE-01"], locationId: storeLocations.locationIds["BACK-01"], qtyOnHand: 30 },
    { sku: "SKU-HAT", warehouseId: warehouseIds["RTL-STORE-01"], locationId: storeLocations.locationIds["FLOOR-01"], qtyOnHand: 75 },
  ]);

  await seedInventoryLotsIfEmpty(prisma, tenantId, [
    { sku: "SKU-TSHIRT", qty: 100, unitCost: 10, warehouseId: warehouseIds["RTL-STORE-01"] },
    { sku: "SKU-JEANS", qty: 50, unitCost: 25, warehouseId: warehouseIds["RTL-STORE-01"] },
    { sku: "SKU-SHOES", qty: 30, unitCost: 50, warehouseId: warehouseIds["RTL-STORE-01"] },
    { sku: "SKU-HAT", qty: 75, unitCost: 8, warehouseId: warehouseIds["RTL-STORE-01"] },
  ]);

  // Seed POS Store
  const storeCount = await prisma.store.count({ where: { tenantId } });
  if (storeCount === 0) {
    const store = await prisma.store.create({
      data: {
        tenantId,
        name: "Main Store",
        code: "STORE-01",
        address: "123 High Street, London",
      },
    });

    // Seed TillShift
    const shift = await prisma.tillShift.create({
      data: {
        tenantId,
        storeId: store.id,
        openedByUserId: (await prisma.user.findFirst({ where: { tenantId } }))?.id || "",
        openedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        openingFloat: new Prisma.Decimal(500),
        status: "open",
      },
    });

    // Seed PosSales
    const sale1 = await prisma.posSale.create({
      data: {
        tenantId,
        storeId: store.id,
        shiftId: shift.id,
        cashierUserId: (await prisma.user.findFirst({ where: { tenantId } }))?.id || "",
        saleNumber: "SALE-001",
        status: "paid",
        subtotal: new Prisma.Decimal(50),
        tax: new Prisma.Decimal(10),
        total: new Prisma.Decimal(60),
        lines: {
          create: [
            { tenantId, sku: "SKU-TSHIRT", name: "T-Shirt", qty: new Prisma.Decimal(2), unitPrice: new Prisma.Decimal(15), taxRate: new Prisma.Decimal(0.2), lineTotal: new Prisma.Decimal(36) },
            { tenantId, sku: "SKU-HAT", name: "Hat", qty: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(10), taxRate: new Prisma.Decimal(0.2), lineTotal: new Prisma.Decimal(12) },
          ],
        },
        payments: {
          create: [
            { tenantId, method: "card", amount: new Prisma.Decimal(60) },
          ],
        },
      },
    });

    const sale2 = await prisma.posSale.create({
      data: {
        tenantId,
        storeId: store.id,
        shiftId: shift.id,
        cashierUserId: (await prisma.user.findFirst({ where: { tenantId } }))?.id || "",
        saleNumber: "SALE-002",
        status: "paid",
        subtotal: new Prisma.Decimal(75),
        tax: new Prisma.Decimal(15),
        total: new Prisma.Decimal(90),
        lines: {
          create: [
            { tenantId, sku: "SKU-JEANS", name: "Jeans", qty: new Prisma.Decimal(2), unitPrice: new Prisma.Decimal(30), taxRate: new Prisma.Decimal(0.2), lineTotal: new Prisma.Decimal(72) },
            { tenantId, sku: "SKU-HAT", name: "Hat", qty: new Prisma.Decimal(1), unitPrice: new Prisma.Decimal(10), taxRate: new Prisma.Decimal(0.2), lineTotal: new Prisma.Decimal(12) },
          ],
        },
        payments: {
          create: [
            { tenantId, method: "cash", amount: new Prisma.Decimal(90) },
          ],
        },
      },
    });

    console.log(`✅ POS: 1 store, 1 shift, 2 sales`);
  }

  // Seed customer invoices (mimic POS sales)
  const invoiceCount = await prisma.customerInvoice.count({ where: { tenantId } });
  if (invoiceCount === 0) {
    const inv1 = await prisma.customerInvoice.create({
      data: {
        tenantId,
        number: "INV-RTL-001",
        customerId: "CUST-RTL-001",
        currency: "GBP",
        total: new Prisma.Decimal(150),
        status: "approved",
        issuedAt: new Date(),
      },
    });

    await prisma.customerPayment.create({
      data: {
        tenantId,
        invoiceId: inv1.id,
        amount: new Prisma.Decimal(150),
        method: "card",
        reference: "POS-SALE-001",
      },
    });

    try {
      const event: FinanceInvoiceCreated = {
        id: newEventId(),
        tenantId,
        type: "finance.invoice.created",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: inv1.id,
          number: inv1.number,
          totalMinor: Number(inv1.total) * 100,
          currencyCode: inv1.currency,
          issuedAt: inv1.issuedAt.toISOString(),
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[Seed] Failed to publish invoice event:`, error);
    }

    console.log(`✅ Customer invoices: 1 created`);
  }

  // Seed purchase orders
  const suppliers = await prisma.supplier.findMany({ where: { tenantId } });
  if (suppliers.length > 0) {
    const poCount = await prisma.purchaseOrder.count({ where: { tenantId } });
    if (poCount === 0) {
      const po = await prisma.purchaseOrder.create({
        data: {
          tenantId,
          supplierId: suppliers[0].id,
          number: "PO-RTL-001",
          currency: "GBP",
          status: "approved",
          lines: {
            create: [
              { tenantId, lineNo: 1, sku: "SKU-TSHIRT", qty: new Prisma.Decimal(200), price: new Prisma.Decimal(10) },
            ],
          },
        },
      });

      try {
        const event: PurchasingPoApproved = {
          id: newEventId(),
          tenantId,
          type: "purchasing.po.approved",
          occurredAt: nowIso(),
          source: "purchasing.po",
          version: 1,
          payload: {
            poId: po.id,
            number: po.number,
            supplierCode: suppliers[0].code,
            totalMinor: 2000 * 100,
            currencyCode: "GBP",
            approvedAt: nowIso(),
          },
        };
        await publishWithOutbox(event);
      } catch (error) {
        console.warn(`[Seed] Failed to publish PO event:`, error);
      }

      console.log(`✅ Purchase orders: 1 created`);
    }
  }

  // Seed bank accounts
  const { accountIds } = await seedBankAccountsIfEmpty(prisma, tenantId, [
    { code: "BANK-RTL-001", name: "Retail Operating Account", currency: "GBP" },
  ]);

  // Seed KPI snapshots
  const kpiCount = await prisma.kpiSnapshot.count({ where: { tenantId } });
  if (kpiCount === 0) {
    await prisma.kpiSnapshot.createMany({
      data: [
        { tenantId, name: "revenue", value: new Prisma.Decimal(150), asOf: new Date() },
        { tenantId, name: "inventory_value", value: new Prisma.Decimal(5000), asOf: new Date() },
        { tenantId, name: "pos_sales_count", value: new Prisma.Decimal(2), asOf: new Date() },
      ],
    });
    console.log(`✅ KPI snapshots: 3 created`);
  }

  console.log(`✅ Retail scenario seed complete!`);
}

if (require.main === module) {
  runScenarioSeed("retail", seedRetailScenario).catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

