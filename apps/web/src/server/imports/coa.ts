/**
 * COA (Chart of Accounts) Import/Export Service
 */

import { prisma } from "@/lib/prisma";
import { parseCsv, mapCsvToRows, parseBoolean } from "./parser";
import { validateCoaRows } from "./validation";
import { auditEvent } from "@/lib/observability/audit";
import type { CoaRow, ImportValidationError } from "./schema";
import type { TenantContext } from "./jobs";

export type CoaPreviewResult = {
  supported: boolean;
  rows: CoaRow[];
  errors: ImportValidationError[];
  message?: string;
};

export type CoaApplyResult = {
  supported: boolean;
  applied: number;
  errors: ImportValidationError[];
  message?: string;
};

/**
 * Export COA to CSV.
 * Returns CSV string with columns: Code,Name,Type,Currency,ParentCode,Active
 */
export async function exportCoaCsv(tenantContext: TenantContext): Promise<{ supported: boolean; csv: string; message?: string }> {
  try {
    // Check if Account model exists
    await (prisma as any).account.count({ take: 0 }).catch(() => {
      throw new Error("Schema gap: Account model missing");
    });

    const accounts = await (prisma as any).account.findMany({
      where: { tenantId: tenantContext.tenantId },
      orderBy: { code: "asc" },
    });

    // Build CSV
    const header = "Code,Name,Type,Currency,ParentCode,Active\n";
    const rows = accounts.map((acc: any) => {
      const code = acc.code || "";
      const name = acc.name || code;
      const type = acc.type || "";
      const currency = ""; // Not in schema
      const parentCode = ""; // Not in schema
      const active = ""; // Not in schema
      return `${code},${escapeCsvField(name)},${type},${currency},${parentCode},${active}`;
    });

    return {
      supported: true,
      csv: header + rows.join("\n"),
    };
  } catch (e: any) {
    return {
      supported: false,
      csv: "",
      message: `Schema gap: ${e?.message || "Account model missing"}`,
    };
  }
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Preview COA import (validate without applying).
 */
export async function previewCoaImport(
  tenantContext: TenantContext,
  csvContents: string
): Promise<CoaPreviewResult> {
  try {
    const { rows: csvRows } = parseCsv(csvContents);

    // Map CSV to CoaRow objects
    const { rows, errors: parseErrors } = mapCsvToRows<CoaRow>(csvRows, (row, rowNum) => {
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
        type: row[2]?.trim() || undefined,
        currency: row[3]?.trim() || undefined,
        parentCode: row[4]?.trim() || undefined,
        active: row[5] ? parseBoolean(row[5]) : undefined,
      };
    });

    // Validate rows
    const validation = await validateCoaRows(tenantContext, rows);

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
      message: `Failed to preview COA import: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Apply COA import (upsert accounts).
 * Only creates new accounts or updates name; does not delete existing accounts.
 */
export async function applyCoaImport(tenantContext: TenantContext, rows: CoaRow[]): Promise<CoaApplyResult> {
  const validation = await validateCoaRows(tenantContext, rows);
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
        // Upsert account (create if missing, update name if exists)
        await (prisma as any).account.upsert({
          where: {
            tenantId_code: {
              tenantId: tenantContext.tenantId,
              code: row.code,
            } as any,
          },
          update: {
            name: row.name,
            // Note: type, currency, parentCode, active fields are not in schema, so ignored
          },
          create: {
            tenantId: tenantContext.tenantId,
            code: row.code,
            name: row.name,
            type: row.type || "asset", // Default to asset if not provided
          },
        });

        applied++;
      } catch (e: any) {
        errors.push({
          row: row.originalRowNumber,
          message: `Failed to upsert account ${row.code}: ${e?.message || "unknown"}`,
        });
      }
    }

    await auditEvent("IMPORT_APPLIED", {
      tenantId: tenantContext.tenantId,
      actorId: tenantContext.userId,
      target: "coa",
      type: "coa",
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
      message: `Failed to apply COA import: ${e?.message || "unknown"}`,
    };
  }
}

