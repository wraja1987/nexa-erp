/**
 * CSV Parser Module
 * Basic CSV parsing without external dependencies.
 */

import type { ImportValidationError } from "./schema";

/**
 * Parse CSV string or buffer into rows.
 * Handles basic CSV format (comma-separated, quoted fields).
 */
export function parseCsv(bufferOrString: string | Buffer): { rows: string[][] } {
  const text = typeof bufferOrString === "string" ? bufferOrString : bufferOrString.toString("utf-8");
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Add last field
    row.push(current.trim());
    rows.push(row);
  }

  return { rows };
}

/**
 * Map CSV rows to typed row objects.
 * Returns array of successfully mapped rows and validation errors.
 */
export function mapCsvToRows<T>(
  rows: string[][],
  mapper: (row: string[], rowNum: number) => T | ImportValidationError
): { rows: T[]; errors: ImportValidationError[] } {
  const mappedRows: T[] = [];
  const errors: ImportValidationError[] = [];

  // Skip header row (row 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const result = mapper(row, i + 1); // 1-based row number

    if ("row" in result && "message" in result) {
      // It's an error
      errors.push(result as ImportValidationError);
    } else {
      // It's a valid row
      mappedRows.push(result as T);
    }
  }

  return { rows: mappedRows, errors };
}

/**
 * Helper to parse number from string, handling decimals and commas.
 */
export function parseNumber(value: string): number | null {
  if (!value || value.trim() === "") return null;
  // Remove commas and parse
  const cleaned = value.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Helper to parse boolean from string.
 */
export function parseBoolean(value: string): boolean | null {
  if (!value || value.trim() === "") return null;
  const lower = value.toLowerCase().trim();
  return lower === "true" || lower === "yes" || lower === "1" || lower === "y";
}

/**
 * Helper to parse ISO date string.
 */
export function parseDate(value: string): Date | null {
  if (!value || value.trim() === "") return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

