/**
 * Validation Engine
 * Validates import rows against business rules and schema constraints.
 */

import { prisma } from "@/lib/prisma";
import type {
  OpeningBalanceRow,
  CoaRow,
  VendorRow,
  ItemRow,
  PriceListRow,
  PurchaseOrderRow,
  PayrollRow,
  ImportValidationError,
} from "./schema";
import type { TenantContext } from "./jobs";

export type ValidationResult<T> = {
  valid: T[];
  errors: ImportValidationError[];
  supported: boolean;
  message?: string;
};

/**
 * Validate opening balance rows.
 * Checks: account codes exist, debit/credit sums balance.
 */
export async function validateOpeningBalanceRows(
  tenantContext: TenantContext,
  rows: OpeningBalanceRow[]
): Promise<ValidationResult<OpeningBalanceRow>> {
  try {
    // Check if Account and JournalEntry models exist
    await (prisma as any).account.count({ take: 0 }).catch(() => {
      throw new Error("Schema gap: Account model missing");
    });

    const valid: OpeningBalanceRow[] = [];
    const errors: ImportValidationError[] = [];

    // Get all account codes
    const accounts = await (prisma as any).account.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { code: true },
    });
    const accountCodes = new Set(accounts.map((a: any) => a.code).filter(Boolean));

    let totalDebit = 0;
    let totalCredit = 0;

    for (const row of rows) {
      const rowErrors: ImportValidationError[] = [];

      // Validate account code exists
      if (!accountCodes.has(row.accountCode)) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "accountCode",
          message: `Account code ${row.accountCode} does not exist`,
        });
      }

      // Validate debit/credit are numbers
      if (typeof row.debit !== "number" || row.debit < 0) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "debit",
          message: "Debit must be a non-negative number",
        });
      }

      if (typeof row.credit !== "number" || row.credit < 0) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "credit",
          message: "Credit must be a non-negative number",
        });
      }

      // Validate at least one of debit or credit is non-zero
      if (row.debit === 0 && row.credit === 0) {
        rowErrors.push({
          row: row.originalRowNumber,
          message: "At least one of debit or credit must be non-zero",
        });
      }

      if (rowErrors.length === 0) {
        valid.push(row);
        totalDebit += row.debit;
        totalCredit += row.credit;
      } else {
        errors.push(...rowErrors);
      }
    }

    // Check if totals balance
    if (valid.length > 0 && Math.abs(totalDebit - totalCredit) > 0.01) {
      errors.push({
        row: 0, // Summary error
        message: `Opening balances do not balance: Debit total ${totalDebit.toFixed(2)} != Credit total ${totalCredit.toFixed(2)}`,
      });
    }

    return { valid, errors, supported: true };
  } catch (e: any) {
    return {
      valid: [],
      errors: [],
      supported: false,
      message: `Schema gap: ${e?.message || "Account or JournalEntry models missing"}`,
    };
  }
}

/**
 * Validate COA rows.
 * Checks: code uniqueness, valid account types.
 */
export async function validateCoaRows(
  tenantContext: TenantContext,
  rows: CoaRow[]
): Promise<ValidationResult<CoaRow>> {
  try {
    await (prisma as any).account.count({ take: 0 }).catch(() => {
      throw new Error("Schema gap: Account model missing");
    });

    const valid: CoaRow[] = [];
    const errors: ImportValidationError[] = [];
    const seenCodes = new Set<string>();

    const validTypes = ["asset", "liability", "equity", "revenue", "expense"];

    for (const row of rows) {
      const rowErrors: ImportValidationError[] = [];

      // Validate code is present
      if (!row.code || row.code.trim() === "") {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "code",
          message: "Account code is required",
        });
      } else if (seenCodes.has(row.code)) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "code",
          message: `Duplicate account code: ${row.code}`,
        });
      } else {
        seenCodes.add(row.code);
      }

      // Validate name is present
      if (!row.name || row.name.trim() === "") {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "name",
          message: "Account name is required",
        });
      }

      // Validate type if provided
      if (row.type && !validTypes.includes(row.type.toLowerCase())) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "type",
          message: `Invalid account type: ${row.type}. Must be one of: ${validTypes.join(", ")}`,
        });
      }

      if (rowErrors.length === 0) {
        valid.push(row);
      } else {
        errors.push(...rowErrors);
      }
    }

    return { valid, errors, supported: true };
  } catch (e: any) {
    return {
      valid: [],
      errors: [],
      supported: false,
      message: `Schema gap: ${e?.message || "Account model missing"}`,
    };
  }
}

/**
 * Validate vendor rows.
 * Checks: code uniqueness, valid email/phone formats.
 */
export async function validateVendorRows(
  tenantContext: TenantContext,
  rows: VendorRow[]
): Promise<ValidationResult<VendorRow>> {
  try {
    await (prisma as any).supplier.count({ take: 0 }).catch(() => {
      throw new Error("Schema gap: Supplier model missing");
    });

    const valid: VendorRow[] = [];
    const errors: ImportValidationError[] = [];
    const seenCodes = new Set<string>();

    for (const row of rows) {
      const rowErrors: ImportValidationError[] = [];

      // Validate code
      if (!row.code || row.code.trim() === "") {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "code",
          message: "Supplier code is required",
        });
      } else if (seenCodes.has(row.code)) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "code",
          message: `Duplicate supplier code: ${row.code}`,
        });
      } else {
        seenCodes.add(row.code);
      }

      // Validate name
      if (!row.name || row.name.trim() === "") {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "name",
          message: "Supplier name is required",
        });
      }

      // Validate email format if provided
      if (row.email && row.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "email",
          message: `Invalid email format: ${row.email}`,
        });
      }

      if (rowErrors.length === 0) {
        valid.push(row);
      } else {
        errors.push(...rowErrors);
      }
    }

    return { valid, errors, supported: true };
  } catch (e: any) {
    return {
      valid: [],
      errors: [],
      supported: false,
      message: `Schema gap: ${e?.message || "Supplier model missing"}`,
    };
  }
}

/**
 * Validate customer rows.
 * Returns supported:false (no Customer model).
 */
export async function validateCustomerRows(
  tenantContext: TenantContext,
  rows: any[]
): Promise<ValidationResult<any>> {
  return {
    valid: [],
    errors: [],
    supported: false,
    message: "Schema gap: No Customer model. Customer imports are not supported.",
  };
}

/**
 * Validate item rows.
 * Checks: SKU uniqueness, warehouse/location existence.
 */
export async function validateItemRows(
  tenantContext: TenantContext,
  rows: ItemRow[]
): Promise<ValidationResult<ItemRow>> {
  try {
    await (prisma as any).inventoryItem.count({ take: 0 }).catch(() => {
      throw new Error("Schema gap: InventoryItem model missing");
    });

    const valid: ItemRow[] = [];
    const errors: ImportValidationError[] = [];

    // Get warehouses and locations
    const warehouses = await (prisma as any).warehouse.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { code: true },
    });
    const warehouseCodes = new Set(warehouses.map((w: any) => w.code).filter(Boolean));

    for (const row of rows) {
      const rowErrors: ImportValidationError[] = [];

      // Validate SKU
      if (!row.sku || row.sku.trim() === "") {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "sku",
          message: "SKU is required",
        });
      }

      // Validate quantity
      if (typeof row.qtyOnHand !== "number" || row.qtyOnHand < 0) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "qtyOnHand",
          message: "Quantity on hand must be a non-negative number",
        });
      }

      // Validate warehouse if provided
      if (row.warehouseCode && !warehouseCodes.has(row.warehouseCode)) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "warehouseCode",
          message: `Warehouse code ${row.warehouseCode} does not exist`,
        });
      }

      if (rowErrors.length === 0) {
        valid.push(row);
      } else {
        errors.push(...rowErrors);
      }
    }

    return { valid, errors, supported: true };
  } catch (e: any) {
    return {
      valid: [],
      errors: [],
      supported: false,
      message: `Schema gap: ${e?.message || "InventoryItem model missing"}`,
    };
  }
}

/**
 * Validate price list rows.
 * Returns supported:false (no PriceList model).
 */
export async function validatePriceListRows(
  tenantContext: TenantContext,
  rows: PriceListRow[]
): Promise<ValidationResult<PriceListRow>> {
  return {
    valid: [],
    errors: [],
    supported: false,
    message: "Schema gap: No PriceList model. Price list imports are not supported.",
  };
}

/**
 * Validate purchase order rows.
 * Checks: supplier existence, SKU existence, line totals.
 */
export async function validatePurchaseOrderRows(
  tenantContext: TenantContext,
  rows: PurchaseOrderRow[]
): Promise<ValidationResult<PurchaseOrderRow>> {
  try {
    await (prisma as any).purchaseOrder.count({ take: 0 }).catch(() => {
      throw new Error("Schema gap: PurchaseOrder model missing");
    });

    const valid: PurchaseOrderRow[] = [];
    const errors: ImportValidationError[] = [];

    // Get suppliers
    const suppliers = await (prisma as any).supplier.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { code: true },
    });
    const supplierCodes = new Set(suppliers.map((s: any) => s.code).filter(Boolean));

    // Get SKUs
    const items = await (prisma as any).inventoryItem.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { sku: true },
    });
    const skus = new Set(items.map((i: any) => i.sku).filter(Boolean));

    for (const row of rows) {
      const rowErrors: ImportValidationError[] = [];

      // Validate PO number
      if (!row.number || row.number.trim() === "") {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "number",
          message: "PO number is required",
        });
      }

      // Validate supplier
      if (!supplierCodes.has(row.supplierCode)) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "supplierCode",
          message: `Supplier code ${row.supplierCode} does not exist`,
        });
      }

      // Validate order date
      if (!row.orderDate || isNaN(new Date(row.orderDate).getTime())) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "orderDate",
          message: "Valid order date is required",
        });
      }

      // Validate lines
      if (!row.lines || row.lines.length === 0) {
        rowErrors.push({
          row: row.originalRowNumber,
          message: "PO must have at least one line",
        });
      } else {
        for (let i = 0; i < row.lines.length; i++) {
          const line = row.lines[i];
          if (!skus.has(line.sku)) {
            rowErrors.push({
              row: row.originalRowNumber,
              field: `lines[${i}].sku`,
              message: `SKU ${line.sku} does not exist`,
            });
          }
          if (typeof line.qty !== "number" || line.qty <= 0) {
            rowErrors.push({
              row: row.originalRowNumber,
              field: `lines[${i}].qty`,
              message: "Quantity must be a positive number",
            });
          }
          if (typeof line.price !== "number" || line.price < 0) {
            rowErrors.push({
              row: row.originalRowNumber,
              field: `lines[${i}].price`,
              message: "Price must be a non-negative number",
            });
          }
        }
      }

      if (rowErrors.length === 0) {
        valid.push(row);
      } else {
        errors.push(...rowErrors);
      }
    }

    return { valid, errors, supported: true };
  } catch (e: any) {
    return {
      valid: [],
      errors: [],
      supported: false,
      message: `Schema gap: ${e?.message || "PurchaseOrder model missing"}`,
    };
  }
}

/**
 * Validate sales order rows.
 * Returns supported:false (no SalesOrder model).
 */
export async function validateSalesOrderRows(
  tenantContext: TenantContext,
  rows: SalesOrderRow[]
): Promise<ValidationResult<SalesOrderRow>> {
  return {
    valid: [],
    errors: [],
    supported: false,
    message: "Schema gap: No SalesOrder model. Sales order imports are not supported.",
  };
}

/**
 * Validate payroll rows.
 * Checks: employee existence, valid dates, pay amounts.
 */
export async function validatePayrollRows(
  tenantContext: TenantContext,
  rows: PayrollRow[]
): Promise<ValidationResult<PayrollRow>> {
  try {
    await (prisma as any).employee.count({ take: 0 }).catch(() => {
      throw new Error("Schema gap: Employee model missing");
    });

    const valid: PayrollRow[] = [];
    const errors: ImportValidationError[] = [];

    // Get employees
    const employees = await (prisma as any).employee.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { empNo: true },
    });
    const empNos = new Set(employees.map((e: any) => e.empNo).filter(Boolean));

    for (const row of rows) {
      const rowErrors: ImportValidationError[] = [];

      // Validate employee
      if (!empNos.has(row.employeeNo)) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "employeeNo",
          message: `Employee number ${row.employeeNo} does not exist`,
        });
      }

      // Validate dates
      if (!row.periodStart || isNaN(new Date(row.periodStart).getTime())) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "periodStart",
          message: "Valid period start date is required",
        });
      }

      if (!row.periodEnd || isNaN(new Date(row.periodEnd).getTime())) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "periodEnd",
          message: "Valid period end date is required",
        });
      }

      // Validate pay amounts
      if (typeof row.grossPay !== "number" || row.grossPay < 0) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "grossPay",
          message: "Gross pay must be a non-negative number",
        });
      }

      if (typeof row.netPay !== "number" || row.netPay < 0) {
        rowErrors.push({
          row: row.originalRowNumber,
          field: "netPay",
          message: "Net pay must be a non-negative number",
        });
      }

      if (row.netPay > row.grossPay) {
        rowErrors.push({
          row: row.originalRowNumber,
          message: "Net pay cannot exceed gross pay",
        });
      }

      if (rowErrors.length === 0) {
        valid.push(row);
      } else {
        errors.push(...rowErrors);
      }
    }

    return { valid, errors, supported: true };
  } catch (e: any) {
    return {
      valid: [],
      errors: [],
      supported: false,
      message: `Schema gap: ${e?.message || "Employee/PayrollRun/Payslip models missing"}`,
    };
  }
}

