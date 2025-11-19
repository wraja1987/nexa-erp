/**
 * Master Data Import Services
 * Handles imports for customers, vendors, items, and price lists.
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { parseCsv, mapCsvToRows, parseNumber } from "./parser";
import { validateCustomerRows, validateVendorRows, validateItemRows, validatePriceListRows } from "./validation";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { ImportsJobCompleted } from "@/server/events/types";
import type { CustomerRow, VendorRow, ItemRow, PriceListRow, ImportValidationError } from "./schema";
import type { TenantContext } from "./jobs";

const CUSTOMER_HEADERS = ["code", "name", "email", "phone", "address"];
const SUPPLIER_HEADERS = ["code", "name", "email", "phone", "address"];
const ITEM_HEADERS = ["sku", "qty_on_hand", "warehouse_code", "location_code"];

export type MasterDataPreviewResult = {
  supported: boolean;
  rows: any[];
  errors: ImportValidationError[];
  message?: string;
};

export type MasterDataApplyResult = {
  supported: boolean;
  applied: number;
  errors: ImportValidationError[];
  message?: string;
};

/**
 * Preview customer import.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function previewCustomerImport(
  tenantContext: TenantContext,
  csvContents: string
): Promise<MasterDataPreviewResult> {
  try {
    const { rows: csvRows } = parseCsv(csvContents);

    // Map CSV to CustomerRow objects
    const { rows, errors: parseErrors } = mapCsvToRows<CustomerRow>(csvRows, (row, rowNum) => {
      if (row.length < 2) {
        return {
          row: rowNum,
          message: "Row must have at least Code and Name columns",
        };
      }

      return {
        originalRowNumber: rowNum,
        code: row[0]?.trim() || "",
        name: row[1]?.trim() || "",
        email: row[2]?.trim() || undefined,
        phone: row[3]?.trim() || undefined,
        address: row[4]?.trim() || undefined,
      };
    });

    return {
      supported: true,
      rows,
      errors: parseErrors,
    };
  } catch (error: any) {
    return {
      supported: true,
      rows: [],
      errors: [{ row: 0, message: String(error?.message || "Parse error") }],
    };
  }
}

/**
 * Apply customer import.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function applyCustomerImport(
  tenantContext: TenantContext,
  rows: CustomerRow[]
): Promise<MasterDataApplyResult> {
  const { prisma } = await import("@/lib/prisma");
  const applied: string[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  for (const row of rows) {
    try {
      // Check if customer already exists
      const existing = await prisma.customer.findUnique({
        where: { code: row.code },
      });

      if (existing) {
        // Update existing
        await prisma.customer.update({
          where: { code: row.code },
          data: {
            name: row.name,
            email: row.email || null,
            phone: row.phone || null,
            address: row.address || null,
          },
        });
      } else {
        // Create new
        await prisma.customer.create({
          data: {
            tenantId: tenantContext.tenantId,
            code: row.code,
            name: row.name,
            email: row.email || null,
            phone: row.phone || null,
            address: row.address || null,
          },
        });
      }

      applied.push(row.code);
    } catch (error: any) {
      errors.push({
        row: row.originalRowNumber,
        message: String(error?.message || "Import error"),
      });
    }
  }

  return {
    supported: true,
    applied: applied.length,
    errors,
  };
}

/**
 * Preview vendor import.
 */
export async function previewVendorImport(
  tenantContext: TenantContext,
  csvContents: string
): Promise<MasterDataPreviewResult> {
  try {
    const { rows: csvRows } = parseCsv(csvContents);

    // Map CSV to VendorRow objects
    const { rows, errors: parseErrors } = mapCsvToRows<VendorRow>(csvRows, (row, rowNum) => {
      if (row.length < 2) {
        return {
          row: rowNum,
          message: "Row must have at least Code and Name columns",
        };
      }

      return {
        originalRowNumber: rowNum,
        code: row[0]?.trim() || "",
        name: row[1]?.trim() || "",
        email: row[2]?.trim() || undefined,
        phone: row[3]?.trim() || undefined,
        address: row[4]?.trim() || undefined,
      };
    });

    // Validate rows
    const validation = await validateVendorRows(tenantContext, rows);

    return {
      supported: validation.supported,
      rows: validation.valid,
      errors: [...parseErrors, ...validation.errors],
      message: validation.message,
    };
  } catch (e: any) {
    return {
      supported: false,
      rows: [],
      errors: [],
      message: `Failed to preview vendor import: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Apply vendor import (upsert suppliers).
 */
export async function applyVendorImport(tenantContext: TenantContext, rows: VendorRow[]): Promise<MasterDataApplyResult> {
  const validation = await validateVendorRows(tenantContext, rows);
  if (!validation.supported) {
    return {
      supported: false,
      applied: 0,
      errors: [],
      message: validation.message,
    };
  }

  try {
    let applied = 0;
    const errors: ImportValidationError[] = [];

    for (const row of validation.valid) {
      try {
        // Upsert supplier
        await (prisma as any).supplier.upsert({
          where: { code: row.code },
          update: {
            name: row.name,
            email: row.email || undefined,
            phone: row.phone || undefined,
          },
          create: {
            tenantId: tenantContext.tenantId,
            code: row.code,
            name: row.name,
            email: row.email || undefined,
            phone: row.phone || undefined,
          },
        });

        applied++;
      } catch (e: any) {
        errors.push({
          row: row.originalRowNumber,
          message: `Failed to upsert supplier ${row.code}: ${e?.message || "unknown"}`,
        });
      }
    }

    await auditEvent("IMPORT_APPLIED", {
      tenantId: tenantContext.tenantId,
      actorId: tenantContext.userId,
      target: "vendors",
      type: "vendors",
      rowsProcessed: rows.length,
      rowsSucceeded: applied,
      rowsFailed: errors.length,
    });

    // Publish event (after import completes)
    try {
      const event: ImportsJobCompleted = {
        id: newEventId(),
        tenantId: tenantContext.tenantId,
        type: "imports.job.completed",
        occurredAt: nowIso(),
        source: "imports.vendors",
        version: 1,
        payload: {
          jobId: `import-vendors-${Date.now()}`,
          importType: "vendors",
          rowsProcessed: rows.length,
          rowsSucceeded: applied,
          rowsFailed: errors.length,
          completedAt: nowIso(),
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[Imports] Failed to publish job.completed event:`, error);
    }

    return {
      supported: true,
      applied,
      errors,
    };
  } catch (e: any) {
    return {
      supported: false,
      applied: 0,
      errors: [],
      message: `Failed to apply vendor import: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Preview item import.
 */
export async function previewItemImport(
  tenantContext: TenantContext,
  csvContents: string
): Promise<MasterDataPreviewResult> {
  try {
    const { rows: csvRows } = parseCsv(csvContents);

    // Map CSV to ItemRow objects
    const { rows, errors: parseErrors } = mapCsvToRows<ItemRow>(csvRows, (row, rowNum) => {
      if (row.length < 2) {
        return {
          row: rowNum,
          message: "Row must have at least SKU and QtyOnHand columns",
        };
      }

      const sku = row[0]?.trim() || "";
      const qtyOnHand = parseNumber(row[1] || "0");
      const warehouseCode = row[2]?.trim() || undefined;
      const locationCode = row[3]?.trim() || undefined;

      if (qtyOnHand === null) {
        return {
          row: rowNum,
          message: "QtyOnHand must be a valid number",
        };
      }

      return {
        originalRowNumber: rowNum,
        sku,
        qtyOnHand,
        warehouseCode,
        locationCode,
      };
    });

    // Validate rows
    const validation = await validateItemRows(tenantContext, rows);

    return {
      supported: validation.supported,
      rows: validation.valid,
      errors: [...parseErrors, ...validation.errors],
      message: validation.message,
    };
  } catch (e: any) {
    return {
      supported: false,
      rows: [],
      errors: [],
      message: `Failed to preview item import: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Apply item import (upsert inventory items).
 */
export async function applyItemImport(tenantContext: TenantContext, rows: ItemRow[]): Promise<MasterDataApplyResult> {
  const validation = await validateItemRows(tenantContext, rows);
  if (!validation.supported) {
    return {
      supported: false,
      applied: 0,
      errors: [],
      message: validation.message,
    };
  }

  try {
    let applied = 0;
    const errors: ImportValidationError[] = [];

    // Get warehouses and locations
    const warehouses = await (prisma as any).warehouse.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { id: true, code: true },
    });
    const warehouseCodeToId = new Map(warehouses.map((w: any) => [w.code, w.id]));

    const locations = await (prisma as any).location.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { id: true, code: true },
    });
    const locationCodeToId = new Map(locations.map((l: any) => [l.code, l.id]));

    for (const row of validation.valid) {
      try {
        const warehouseId = row.warehouseCode ? warehouseCodeToId.get(row.warehouseCode) : null;
        const locationId = row.locationCode ? locationCodeToId.get(row.locationCode) : null;

        // Upsert inventory item
        await (prisma as any).inventoryItem.upsert({
          where: {
            tenantId_sku: {
              tenantId: tenantContext.tenantId,
              sku: row.sku,
            } as any,
          },
          update: {
            qtyOnHand: row.qtyOnHand as any,
            warehouseId: warehouseId || undefined,
            locationId: locationId || undefined,
          },
          create: {
            tenantId: tenantContext.tenantId,
            sku: row.sku,
            qtyOnHand: row.qtyOnHand as any,
            warehouseId: warehouseId || undefined,
            locationId: locationId || undefined,
          },
        });

        applied++;
      } catch (e: any) {
        errors.push({
          row: row.originalRowNumber,
          message: `Failed to upsert item ${row.sku}: ${e?.message || "unknown"}`,
        });
      }
    }

    await auditEvent("IMPORT_APPLIED", {
      tenantId: tenantContext.tenantId,
      actorId: tenantContext.userId,
      target: "items",
      type: "items",
      rowsProcessed: rows.length,
      rowsSucceeded: applied,
      rowsFailed: errors.length,
    });

    return {
      supported: true,
      applied,
      errors,
    };
  } catch (e: any) {
    return {
      supported: false,
      applied: 0,
      errors: [],
      message: `Failed to apply item import: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Preview price list import.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function previewPriceListImport(
  tenantContext: TenantContext,
  csvContents: string
): Promise<MasterDataPreviewResult> {
  try {
    const { rows: csvRows } = parseCsv(csvContents);

    // Map CSV to PriceListRow objects
    const { rows, errors: parseErrors } = mapCsvToRows<PriceListRow>(csvRows, (row, rowNum) => {
      if (row.length < 3) {
        return {
          row: rowNum,
          message: "Row must have at least PriceListCode, SKU, and Price columns",
        };
      }

      return {
        originalRowNumber: rowNum,
        priceListCode: row[0]?.trim() || "",
        sku: row[1]?.trim() || "",
        price: parseNumber(row[2]?.trim() || "0"),
      };
    });

    return {
      supported: true,
      rows,
      errors: parseErrors,
    };
  } catch (error: any) {
    return {
      supported: true,
      rows: [],
      errors: [{ row: 0, message: String(error?.message || "Parse error") }],
    };
  }
}

/**
 * Apply price list import.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function applyPriceListImport(
  tenantContext: TenantContext,
  rows: PriceListRow[]
): Promise<MasterDataApplyResult> {
  const { prisma } = await import("@/lib/prisma");
  const applied: string[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  // Group by price list code
  const byPriceList = new Map<string, PriceListRow[]>();
  for (const row of rows) {
    const list = byPriceList.get(row.priceListCode) || [];
    list.push(row);
    byPriceList.set(row.priceListCode, list);
  }

  for (const [priceListCode, items] of byPriceList.entries()) {
    try {
      // Find or create price list
      let priceList = await prisma.priceList.findUnique({
        where: { code: priceListCode },
      });

      if (!priceList) {
        priceList = await prisma.priceList.create({
          data: {
            tenantId: tenantContext.tenantId,
            code: priceListCode,
            name: priceListCode,
            currency: "GBP",
            active: true,
          },
        });
      }

      // Upsert price list items
      for (const item of items) {
        await prisma.priceListItem.upsert({
          where: {
            priceListId_sku: {
              priceListId: priceList.id,
              sku: item.sku,
            },
          },
          update: {
            price: item.price,
          },
          create: {
            priceListId: priceList.id,
            sku: item.sku,
            price: item.price,
          },
        });
      }

      applied.push(priceListCode);
    } catch (error: any) {
      errors.push({
        row: items[0]?.originalRowNumber || 0,
        message: String(error?.message || "Import error"),
      });
    }
  }

  return {
    supported: true,
    applied: applied.length,
    errors,
  };
}

