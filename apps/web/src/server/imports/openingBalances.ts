/**
 * Opening Balances Import Service
 */

import { prisma } from "@/lib/prisma";
import { parseCsv, mapCsvToRows, parseNumber } from "./parser";
import { validateOpeningBalanceRows } from "./validation";
import { getTrialBalance } from "@/server/finance/gl";
import { auditEvent } from "@/lib/observability/audit";
import type { OpeningBalanceRow, ImportValidationError } from "./schema";
import type { TenantContext } from "./jobs";

export type OpeningBalancesPreviewResult = {
  supported: boolean;
  rows: OpeningBalanceRow[];
  errors: ImportValidationError[];
  totals: { debit: number; credit: number };
  message?: string;
};

export type OpeningBalancesApplyResult = {
  supported: boolean;
  applied: number;
  errors: ImportValidationError[];
  entryId?: string;
  message?: string;
};

/**
 * Preview opening balances import.
 * Validates CSV and checks that debit/credit sums balance.
 */
export async function previewOpeningBalancesImport(
  tenantContext: TenantContext,
  csvContents: string
): Promise<OpeningBalancesPreviewResult> {
  try {
    const { rows: csvRows } = parseCsv(csvContents);

    // Map CSV to OpeningBalanceRow objects
    const { rows, errors: parseErrors } = mapCsvToRows<OpeningBalanceRow>(csvRows, (row, rowNum) => {
      if (row.length < 3) {
        return {
          row: rowNum,
          message: "Row must have at least AccountCode, Debit, and Credit columns",
        };
      }

      const accountCode = row[0]?.trim() || "";
      const debit = parseNumber(row[1] || "0");
      const credit = parseNumber(row[2] || "0");

      if (debit === null || credit === null) {
        return {
          row: rowNum,
          message: "Debit and Credit must be valid numbers",
        };
      }

      return {
        originalRowNumber: rowNum,
        accountCode,
        debit,
        credit,
      };
    });

    // Validate rows
    const validation = await validateOpeningBalanceRows(tenantContext, rows);

    // Calculate totals
    const totals = validation.valid.reduce(
      (acc, row) => {
        acc.debit += row.debit;
        acc.credit += row.credit;
        return acc;
      },
      { debit: 0, credit: 0 }
    );

    return {
      supported: validation.supported,
      rows: validation.valid,
      errors: [...parseErrors, ...validation.errors],
      totals,
      message: validation.message,
    };
  } catch (e: any) {
    return {
      supported: false,
      rows: [],
      errors: [],
      totals: { debit: 0, credit: 0 },
      message: `Failed to preview opening balances import: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Apply opening balances import.
 * Creates a JournalEntry with docRef="OPENING_BALANCES" and JournalLines.
 */
export async function applyOpeningBalancesImport(
  tenantContext: TenantContext,
  rows: OpeningBalanceRow[]
): Promise<OpeningBalancesApplyResult> {
  const validation = await validateOpeningBalanceRows(tenantContext, rows);
  if (!validation.supported) {
    return {
      supported: false,
      applied: 0,
      errors: [],
      message: validation.message,
    };
  }

  try {
    // Check if JournalEntry model exists
    await (prisma as any).journalEntry.count({ take: 0 }).catch(() => {
      throw new Error("Schema gap: JournalEntry model missing");
    });

    // Get account IDs by code
    const accounts = await (prisma as any).account.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { id: true, code: true },
    });
    const codeToId = new Map(accounts.map((a: any) => [a.code, a.id]));

    // Create journal entry
    const entry = await (prisma as any).journalEntry.create({
      data: {
        tenantId: tenantContext.tenantId,
        docRef: "OPENING_BALANCES",
        memo: `Opening balances imported on ${new Date().toISOString()}`,
        postedAt: new Date(),
        lines: {
          create: validation.valid.map((row) => ({
            tenantId: tenantContext.tenantId,
            accountId: codeToId.get(row.accountCode)!,
            debit: row.debit as any,
            credit: row.credit as any,
          })),
        },
      },
      include: { lines: true },
    });

    await auditEvent("IMPORT_APPLIED", {
      tenantId: tenantContext.tenantId,
      actorId: tenantContext.userId,
      target: entry.id,
      type: "opening_balances",
      rowsProcessed: rows.length,
      rowsSucceeded: validation.valid.length,
      rowsFailed: validation.errors.length,
    });

    return {
      supported: true,
      applied: validation.valid.length,
      errors: validation.errors,
      entryId: entry.id,
    };
  } catch (e: any) {
    return {
      supported: false,
      applied: 0,
      errors: [],
      message: `Schema gap: ${e?.message || "JournalEntry or JournalLine models missing"}`,
    };
  }
}

/**
 * Export trial balance to CSV.
 * Uses existing getTrialBalance() function.
 */
export async function exportTrialBalanceCsv(
  tenantContext: TenantContext,
  asOf?: Date
): Promise<{ supported: boolean; csv: string; message?: string }> {
  try {
    const tb = await getTrialBalance(tenantContext.tenantId, asOf);

    // Build CSV
    const header = "Code,Name,Type,Debit,Credit,Balance\n";
    const rows = tb.rows.map((r) => {
      return `${r.code},${escapeCsvField(r.name)},${r.type},${r.debit.toFixed(2)},${r.credit.toFixed(2)},${r.balance.toFixed(2)}`;
    });

    return {
      supported: true,
      csv: header + rows.join("\n"),
    };
  } catch (e: any) {
    return {
      supported: false,
      csv: "",
      message: `Failed to export trial balance: ${e?.message || "unknown"}`,
    };
  }
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

