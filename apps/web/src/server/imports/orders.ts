/**
 * Orders Import Services
 * Handles imports for purchase orders and sales orders.
 */

import { prisma } from "@/lib/prisma";
import { parseCsv, mapCsvToRows, parseNumber, parseDate } from "./parser";
import { validatePurchaseOrderRows, validateSalesOrderRows } from "./validation";
import { auditEvent } from "@/lib/observability/audit";
import type { PurchaseOrderRow, SalesOrderRow, ImportValidationError } from "./schema";
import type { TenantContext } from "./jobs";

export type OrdersPreviewResult = {
  supported: boolean;
  rows: any[];
  errors: ImportValidationError[];
  message?: string;
};

export type OrdersApplyResult = {
  supported: boolean;
  applied: number;
  errors: ImportValidationError[];
  message?: string;
};

/**
 * Preview purchase order import.
 */
export async function previewPurchaseOrderImport(
  tenantContext: TenantContext,
  csvContents: string
): Promise<OrdersPreviewResult> {
  try {
    const { rows: csvRows } = parseCsv(csvContents);

    // Group rows by PO number (assuming first column is PO number, second is supplier, etc.)
    // Format: Number,SupplierCode,OrderDate,SKU,Qty,Price
    const poMap = new Map<string, PurchaseOrderRow>();

    const { rows, errors: parseErrors } = mapCsvToRows<PurchaseOrderRow>(csvRows, (row, rowNum) => {
      if (row.length < 6) {
        return {
          row: rowNum,
          message: "Row must have at least Number,SupplierCode,OrderDate,SKU,Qty,Price columns",
        };
      }

      const number = row[0]?.trim() || "";
      const supplierCode = row[1]?.trim() || "";
      const orderDate = row[2]?.trim() || "";
      const sku = row[3]?.trim() || "";
      const qty = parseNumber(row[4] || "0");
      const price = parseNumber(row[5] || "0");

      if (!number || !supplierCode || !orderDate) {
        return {
          row: rowNum,
          message: "Number, SupplierCode, and OrderDate are required",
        };
      }

      if (qty === null || price === null) {
        return {
          row: rowNum,
          message: "Qty and Price must be valid numbers",
        };
      }

      if (!poMap.has(number)) {
        poMap.set(number, {
          originalRowNumber: rowNum,
          number,
          supplierCode,
          orderDate,
          expectedDate: row[6]?.trim() || undefined,
          currency: row[7]?.trim() || "GBP",
          lines: [],
        });
      }

      const po = poMap.get(number)!;
      po.lines.push({ sku, qty, price });

      return po;
    });

    // Deduplicate rows (one per PO number)
    const uniqueRows = Array.from(poMap.values());

    // Validate rows
    const validation = await validatePurchaseOrderRows(tenantContext, uniqueRows);

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
      message: `Failed to preview purchase order import: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Apply purchase order import.
 * Creates PurchaseOrder and PoLine records in draft status.
 */
export async function applyPurchaseOrderImport(
  tenantContext: TenantContext,
  rows: PurchaseOrderRow[]
): Promise<OrdersApplyResult> {
  const validation = await validatePurchaseOrderRows(tenantContext, rows);
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

    // Get suppliers
    const suppliers = await (prisma as any).supplier.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { id: true, code: true },
    });
    const supplierCodeToId = new Map(suppliers.map((s: any) => [s.code, s.id]));

    for (const row of validation.valid) {
      try {
        const supplierId = supplierCodeToId.get(row.supplierCode);
        if (!supplierId) {
          errors.push({
            row: row.originalRowNumber,
            message: `Supplier ${row.supplierCode} not found`,
          });
          continue;
        }

        // Calculate total
        const total = row.lines.reduce((sum, line) => sum + line.qty * line.price, 0);

        // Create purchase order
        const po = await (prisma as any).purchaseOrder.create({
          data: {
            tenantId: tenantContext.tenantId,
            number: row.number,
            supplierId,
            currency: row.currency || "GBP",
            orderDate: new Date(row.orderDate),
            expectedAt: row.expectedDate ? new Date(row.expectedDate) : undefined,
            status: "draft" as any, // Ensure draft status
            lines: {
              create: row.lines.map((line, idx) => ({
                tenantId: tenantContext.tenantId,
                lineNo: idx + 1,
                sku: line.sku,
                qty: line.qty as any,
                price: line.price as any,
              })),
            },
          },
        });

        applied++;
      } catch (e: any) {
        errors.push({
          row: row.originalRowNumber,
          message: `Failed to create PO ${row.number}: ${e?.message || "unknown"}`,
        });
      }
    }

    await auditEvent("IMPORT_APPLIED", {
      tenantId: tenantContext.tenantId,
      actorId: tenantContext.userId,
      target: "purchase_orders",
      type: "purchase_orders",
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
      message: `Failed to apply purchase order import: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Preview sales order import.
 * Returns supported:false (no SalesOrder model).
 */
export async function previewSalesOrderImport(
  tenantContext: TenantContext,
  csvContents: string
): Promise<OrdersPreviewResult> {
  try {
    const { rows: csvRows } = parseCsv(csvContents);

    // Group rows by order number
    // Format: Number,CustomerCode,OrderDate,SKU,Description,Qty,Price
    const orderMap = new Map<string, SalesOrderRow>();

    const { rows, errors: parseErrors } = mapCsvToRows<SalesOrderRow>(csvRows, (row, rowNum) => {
      if (row.length < 7) {
        return {
          row: rowNum,
          message: "Row must have at least Number,CustomerCode,OrderDate,SKU,Description,Qty,Price columns",
        };
      }

      const number = row[0]?.trim() || "";
      const customerCode = row[1]?.trim() || "";
      const orderDate = parseDate(row[2]?.trim() || "");
      const sku = row[3]?.trim() || "";
      const description = row[4]?.trim() || "";
      const qty = parseNumber(row[5]?.trim() || "0");
      const price = parseNumber(row[6]?.trim() || "0");

      if (!orderMap.has(number)) {
        orderMap.set(number, {
          originalRowNumber: rowNum,
          number,
          customerCode,
          orderDate,
          lines: [],
        });
      }

      const order = orderMap.get(number)!;
      order.lines.push({ sku, description, qty, price });

      return null; // No error
    });

    const validation = await validateSalesOrderRows(tenantContext, Array.from(orderMap.values()));

    return {
      supported: true,
      rows: validation.valid,
      errors: [...parseErrors.filter((e) => e !== null), ...validation.errors],
      message: validation.message,
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
 * Apply sales order import.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function applySalesOrderImport(
  tenantContext: TenantContext,
  rows: SalesOrderRow[]
): Promise<OrdersApplyResult> {
  const applied: string[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  // Get customer code to ID mapping
  const customers = await prisma.customer.findMany({
    where: { tenantId: tenantContext.tenantId },
    select: { id: true, code: true },
  });
  const customerCodeToId = new Map(customers.map((c) => [c.code, c.id]));

  for (const row of rows) {
    try {
      const customerId = customerCodeToId.get(row.customerCode);
      if (!customerId) {
        errors.push({
          row: row.originalRowNumber,
          message: `Customer not found: ${row.customerCode}`,
        });
        continue;
      }

      // Check if order already exists
      const existing = await prisma.salesOrder.findUnique({
        where: { number: row.number },
      });

      if (existing) {
        errors.push({
          row: row.originalRowNumber,
          message: `Order already exists: ${row.number}`,
        });
        continue;
      }

      // Calculate total
      const total = row.lines.reduce((sum, line) => sum + line.qty * line.price, 0);

      // Create order with lines
      await prisma.salesOrder.create({
        data: {
          tenantId: tenantContext.tenantId,
          customerId,
          number: row.number,
          status: "draft",
          total,
          currency: "GBP",
          orderDate: row.orderDate,
          lines: {
            create: row.lines.map((line, idx) => ({
              lineNo: idx + 1,
              sku: line.sku,
              description: line.description,
              qty: line.qty,
              price: line.price,
              total: line.qty * line.price,
              reservedQty: 0,
              backorderQty: 0,
            })),
          },
        },
      });

      applied.push(row.number);
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

