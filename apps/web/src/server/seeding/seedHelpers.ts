import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { applyCoaTemplate, type CoATemplateId } from "@/server/admin/coa-templates";
import { prisma } from "@/lib/prisma";

export type ScenarioKey = "manufacturing" | "retail" | "consulting" | "healthcare";

export interface ScenarioTenantConfig {
  key: ScenarioKey;
  name: string;
  code: string;
  coaTemplate: CoATemplateId;
  defaultUserEmail: string;
  defaultUserPassword: string;
  defaultUserRole: string;
}

const SCENARIO_CONFIGS: Record<ScenarioKey, ScenarioTenantConfig> = {
  manufacturing: {
    key: "manufacturing",
    name: "Nexa Manufacturing Demo",
    code: "SCN_MANUFACTURING",
    coaTemplate: "MANUFACTURING_BASE",
    defaultUserEmail: "admin@manufacturing.nexa.demo",
    defaultUserPassword: "Demo123!",
    defaultUserRole: "ADMIN",
  },
  retail: {
    key: "retail",
    name: "Nexa Retail Demo",
    code: "SCN_RETAIL",
    coaTemplate: "RETAIL_BASE",
    defaultUserEmail: "admin@retail.nexa.demo",
    defaultUserPassword: "Demo123!",
    defaultUserRole: "ADMIN",
  },
  consulting: {
    key: "consulting",
    name: "Nexa Consulting Demo",
    code: "SCN_CONSULTING",
    coaTemplate: "UK_SMALL_SERVICE",
    defaultUserEmail: "admin@consulting.nexa.demo",
    defaultUserPassword: "Demo123!",
    defaultUserRole: "ADMIN",
  },
  healthcare: {
    key: "healthcare",
    name: "Nexa Healthcare Demo",
    code: "SCN_HEALTHCARE",
    coaTemplate: "GP_PRACTICE",
    defaultUserEmail: "admin@healthcare.nexa.demo",
    defaultUserPassword: "Demo123!",
    defaultUserRole: "ADMIN",
  },
};

/**
 * Ensure scenario tenant exists (idempotent).
 * Looks up by name or code, creates if missing.
 */
export async function ensureScenarioTenant(
  prismaClient: PrismaClient,
  scenarioKey: ScenarioKey
): Promise<{ tenantId: string; entityId?: string }> {
  const config = SCENARIO_CONFIGS[scenarioKey];
  if (!config) {
    throw new Error(`Unknown scenario key: ${scenarioKey}`);
  }

  // Try to find by name first
  let tenant = await prismaClient.tenant.findFirst({
    where: { name: config.name },
  });

  // If not found, try by code (if Tenant had a code field, but it doesn't, so we use name)
  if (!tenant) {
    tenant = await prismaClient.tenant.create({
      data: { name: config.name },
    });
  }

  // Ensure Entity exists for this tenant
  let entity = await prismaClient.entity.findFirst({
    where: { tenantId: tenant.id, name: config.name },
  });

  if (!entity) {
    entity = await prismaClient.entity.create({
      data: {
        tenantId: tenant.id,
        name: config.name,
        currencyCode: "GBP",
      },
    });
  }

  return { tenantId: tenant.id, entityId: entity.id };
}

/**
 * Ensure scenario user exists (idempotent).
 * Creates or upserts a user under the tenant.
 */
export async function ensureScenarioUser(
  prismaClient: PrismaClient,
  tenantId: string,
  email: string,
  role: string = "ADMIN",
  password: string = "Demo123!"
): Promise<{ userId: string }> {
  const passwordHash = await bcrypt.hash(password, 10);
  const emailLower = email.toLowerCase();

  const user = await prismaClient.user.upsert({
    where: { email: emailLower },
    update: {
      password_hash: passwordHash as any,
      role: role as any,
      active: true,
      tenantId,
    } as any,
    create: {
      email: emailLower,
      password_hash: passwordHash as any,
      role: role as any,
      active: true,
      tenantId,
    } as any,
  });

  return { userId: user.id };
}

/**
 * Seed CoA accounts if empty (idempotent).
 * Uses CoA template from scenario config.
 */
export async function seedAccountsIfEmpty(
  prismaClient: PrismaClient,
  tenantId: string,
  scenarioKey: ScenarioKey
): Promise<{ accountsCreated: number; accountsSkipped: number }> {
  const config = SCENARIO_CONFIGS[scenarioKey];
  if (!config) {
    throw new Error(`Unknown scenario key: ${scenarioKey}`);
  }

  // Check if accounts already exist
  const existingCount = await prismaClient.account.count({
    where: { tenantId },
  });

  if (existingCount > 0) {
    return { accountsCreated: 0, accountsSkipped: 0 };
  }

  // Apply CoA template
  const result = await applyCoaTemplate(tenantId, config.coaTemplate, "system");
  return {
    accountsCreated: result.accountsCreated,
    accountsSkipped: result.accountsSkipped,
  };
}

/**
 * Seed opening balances (idempotent).
 * Creates a few JournalEntry + JournalLine entries for opening balances.
 */
export async function seedOpeningBalancesIfEmpty(
  prismaClient: PrismaClient,
  tenantId: string,
  scenarioKey: ScenarioKey
): Promise<{ entriesCreated: number }> {
  // Check if opening balance entries already exist
  const existingCount = await prismaClient.journalEntry.count({
    where: { tenantId, memo: { contains: "Opening Balance" } },
  });

  if (existingCount > 0) {
    return { entriesCreated: 0 };
  }

  // Get cash account (should exist from CoA)
  const cashAccount = await prismaClient.account.findFirst({
    where: { tenantId, code: "1000" },
  });

  if (!cashAccount) {
    console.warn(`[Seed] No cash account (1000) found for tenant ${tenantId}, skipping opening balances`);
    return { entriesCreated: 0 };
  }

  // Get equity account
  const equityAccount = await prismaClient.account.findFirst({
    where: { tenantId, code: "3000" },
  });

  if (!equityAccount) {
    console.warn(`[Seed] No equity account (3000) found for tenant ${tenantId}, skipping opening balances`);
    return { entriesCreated: 0 };
  }

  // Create opening balance entry
  const entry = await prismaClient.journalEntry.create({
    data: {
      tenantId,
      memo: "Opening Balance",
      postedAt: new Date(new Date().getFullYear(), 0, 1), // Start of year
      lines: {
        create: [
          {
            tenantId,
            accountId: cashAccount.id,
            debit: new Prisma.Decimal(100000),
            credit: new Prisma.Decimal(0),
          },
          {
            tenantId,
            accountId: equityAccount.id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(100000),
          },
        ],
      },
    },
  });

  return { entriesCreated: 1 };
}

/**
 * Seed suppliers if empty (idempotent).
 * Creates a few Supplier rows with deterministic codes.
 */
export async function seedSuppliersIfEmpty(
  prismaClient: PrismaClient,
  tenantId: string,
  scenarioKey: ScenarioKey,
  supplierCodes: string[]
): Promise<{ suppliersCreated: number }> {
  let created = 0;

  for (const code of supplierCodes) {
    const existing = await prismaClient.supplier.findUnique({
      where: { code },
    });

    if (!existing) {
      await prismaClient.supplier.create({
        data: {
          tenantId,
          code,
          name: `Supplier ${code}`,
          email: `supplier-${code.toLowerCase()}@example.com`,
        },
      });
      created++;
    }
  }

  return { suppliersCreated: created };
}

/**
 * Seed warehouses if empty (idempotent).
 * Creates Warehouse rows with deterministic codes.
 */
export async function seedWarehousesIfEmpty(
  prismaClient: PrismaClient,
  tenantId: string,
  warehouseCodes: Array<{ code: string; name: string }>
): Promise<{ warehousesCreated: number; warehouseIds: Record<string, string> }> {
  const warehouseIds: Record<string, string> = {};
  let created = 0;

  for (const wh of warehouseCodes) {
    const existing = await prismaClient.warehouse.findUnique({
      where: { code: wh.code },
    });

    if (existing) {
      warehouseIds[wh.code] = existing.id;
    } else {
      const warehouse = await prismaClient.warehouse.create({
        data: {
          tenantId,
          code: wh.code,
          name: wh.name,
        },
      });
      warehouseIds[wh.code] = warehouse.id;
      created++;
    }
  }

  return { warehousesCreated: created, warehouseIds };
}

/**
 * Seed locations (bins) if empty (idempotent).
 * Creates Location rows within warehouses.
 */
export async function seedLocationsIfEmpty(
  prismaClient: PrismaClient,
  tenantId: string,
  warehouseId: string,
  locationCodes: Array<{ code: string; type?: string }>
): Promise<{ locationsCreated: number; locationIds: Record<string, string> }> {
  const locationIds: Record<string, string> = {};
  let created = 0;

  for (const loc of locationCodes) {
    const existing = await prismaClient.location.findFirst({
      where: { tenantId, warehouseId, code: loc.code },
    });

    if (existing) {
      locationIds[loc.code] = existing.id;
    } else {
      const location = await prismaClient.location.create({
        data: {
          tenantId,
          warehouseId,
          code: loc.code,
          type: loc.type,
        },
      });
      locationIds[loc.code] = location.id;
      created++;
    }
  }

  return { locationsCreated: created, locationIds };
}

/**
 * Seed inventory items if empty (idempotent).
 * Creates InventoryItem rows with deterministic SKUs.
 */
export async function seedInventoryItemsIfEmpty(
  prismaClient: PrismaClient,
  tenantId: string,
  items: Array<{
    sku: string;
    warehouseId?: string;
    locationId?: string;
    qtyOnHand: number;
  }>
): Promise<{ itemsCreated: number }> {
  let created = 0;

  for (const item of items) {
    const existing = await prismaClient.inventoryItem.findFirst({
      where: {
        tenantId,
        sku: item.sku,
        warehouseId: item.warehouseId || null,
        locationId: item.locationId || null,
      },
    });

    if (!existing) {
      await prismaClient.inventoryItem.create({
        data: {
          tenantId,
          sku: item.sku,
          qtyOnHand: new Prisma.Decimal(item.qtyOnHand),
          warehouseId: item.warehouseId || null,
          locationId: item.locationId || null,
        },
      });
      created++;
    }
  }

  return { itemsCreated: created };
}

/**
 * Seed inventory lots if empty (idempotent).
 * Creates InventoryLot rows for FIFO/WAV costing.
 */
export async function seedInventoryLotsIfEmpty(
  prismaClient: PrismaClient,
  tenantId: string,
  lots: Array<{
    sku: string;
    qty: number;
    unitCost: number;
    warehouseId?: string;
    locationId?: string;
    receivedAt?: Date;
  }>
): Promise<{ lotsCreated: number }> {
  let created = 0;

  for (const lot of lots) {
    await prismaClient.inventoryLot.create({
      data: {
        tenantId,
        sku: lot.sku,
        qty: new Prisma.Decimal(lot.qty),
        unitCost: new Prisma.Decimal(lot.unitCost),
        warehouseId: lot.warehouseId || null,
        locationId: lot.locationId || null,
        receivedAt: lot.receivedAt || new Date(),
      },
    });
    created++;
  }

  return { lotsCreated: created };
}

/**
 * Seed employees if empty (idempotent).
 * Creates Employee rows with deterministic employee numbers.
 */
export async function seedEmployeesIfEmpty(
  prismaClient: PrismaClient,
  tenantId: string,
  employees: Array<{
    empNo: string;
    firstName: string;
    lastName: string;
    email?: string;
  }>
): Promise<{ employeesCreated: number; employeeIds: Record<string, string> }> {
  const employeeIds: Record<string, string> = {};
  let created = 0;

  for (const emp of employees) {
    const existing = await prismaClient.employee.findUnique({
      where: { empNo: emp.empNo },
    });

    if (existing) {
      employeeIds[emp.empNo] = existing.id;
    } else {
      const employee = await prismaClient.employee.create({
        data: {
          tenantId,
          empNo: emp.empNo,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
        },
      });
      employeeIds[emp.empNo] = employee.id;
      created++;
    }
  }

  return { employeesCreated: created, employeeIds };
}

/**
 * Seed bank accounts if empty (idempotent).
 * Creates BankAccount rows with deterministic codes.
 */
export async function seedBankAccountsIfEmpty(
  prismaClient: PrismaClient,
  tenantId: string,
  accounts: Array<{ code: string; name: string; currency?: string }>
): Promise<{ accountsCreated: number; accountIds: Record<string, string> }> {
  const accountIds: Record<string, string> = {};
  let created = 0;

  for (const acc of accounts) {
    const existing = await prismaClient.bankAccount.findUnique({
      where: { tenantId_code: { tenantId, code: acc.code } as any },
    });

    if (existing) {
      accountIds[acc.code] = existing.id;
    } else {
      const bankAccount = await prismaClient.bankAccount.create({
        data: {
          tenantId,
          code: acc.code,
          name: acc.name,
          currency: acc.currency || "GBP",
        },
      });
      accountIds[acc.code] = bankAccount.id;
      created++;
    }
  }

  return { accountsCreated: created, accountIds };
}

/**
 * Get scenario config.
 */
export function getScenarioConfig(scenarioKey: ScenarioKey): ScenarioTenantConfig {
  const config = SCENARIO_CONFIGS[scenarioKey];
  if (!config) {
    throw new Error(`Unknown scenario key: ${scenarioKey}`);
  }
  return config;
}

