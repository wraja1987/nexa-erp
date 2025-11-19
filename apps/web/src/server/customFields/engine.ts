/**
 * Phase 25 — Custom Fields Engine Core Logic
 * 
 * Pure, side-effect-free validation and normalization functions.
 */

import type {
  CustomFieldDefinition,
  CustomFieldValue,
  ValidationResult,
} from "./types";

/**
 * Validate a value against a field definition
 */
export function validateValue(
  def: CustomFieldDefinition,
  value: unknown
): ValidationResult {
  const errors: string[] = [];

  // Required check
  if (def.required && (value === null || value === undefined || value === "")) {
    errors.push(`Field "${def.label}" is required`);
    return { valid: false, errors };
  }

  // Skip validation if value is empty and not required
  if (value === null || value === undefined || value === "") {
    return { valid: true, errors: [] };
  }

  // Type-specific validation
  switch (def.type) {
    case "text":
      if (typeof value !== "string") {
        errors.push(`Field "${def.label}" must be text`);
      }
      break;

    case "number":
      if (typeof value !== "number" && typeof value !== "string") {
        errors.push(`Field "${def.label}" must be a number`);
      } else {
        const num = typeof value === "string" ? parseFloat(value) : value;
        if (isNaN(num)) {
          errors.push(`Field "${def.label}" must be a valid number`);
        }
      }
      break;

    case "date":
      if (!(value instanceof Date) && typeof value !== "string") {
        errors.push(`Field "${def.label}" must be a date`);
      } else {
        const date = value instanceof Date ? value : new Date(value as string);
        if (isNaN(date.getTime())) {
          errors.push(`Field "${def.label}" must be a valid date`);
        }
      }
      break;

    case "boolean":
      if (typeof value !== "boolean" && value !== "true" && value !== "false" && value !== 1 && value !== 0) {
        errors.push(`Field "${def.label}" must be a boolean`);
      }
      break;

    case "picklist":
      if (typeof value !== "string") {
        errors.push(`Field "${def.label}" must be a string`);
      } else if (def.options && !def.options.includes(value)) {
        errors.push(`Field "${def.label}" must be one of: ${def.options.join(", ")}`);
      }
      break;

    case "multi-select":
      if (!Array.isArray(value)) {
        errors.push(`Field "${def.label}" must be an array`);
      } else if (def.options) {
        const invalid = (value as string[]).filter((v) => !def.options!.includes(v));
        if (invalid.length > 0) {
          errors.push(`Field "${def.label}" contains invalid options: ${invalid.join(", ")}`);
        }
      }
      break;

    case "reference":
      if (typeof value !== "string") {
        errors.push(`Field "${def.label}" must be a reference ID (string)`);
      }
      break;

    default:
      errors.push(`Unknown field type: ${(def as any).type}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize a value according to field definition
 */
export function normalizeValue(def: CustomFieldDefinition, value: unknown): any {
  if (value === null || value === undefined || value === "") {
    return def.defaultValue ?? null;
  }

  switch (def.type) {
    case "text":
      return String(value);

    case "number":
      if (typeof value === "number") return value;
      const num = parseFloat(String(value));
      return isNaN(num) ? def.defaultValue ?? null : num;

    case "date":
      if (value instanceof Date) return value.toISOString();
      const date = new Date(String(value));
      return isNaN(date.getTime()) ? def.defaultValue ?? null : date.toISOString();

    case "boolean":
      if (typeof value === "boolean") return value;
      if (value === "true" || value === 1 || value === "1") return true;
      if (value === "false" || value === 0 || value === "0") return false;
      return def.defaultValue ?? false;

    case "picklist":
      return String(value);

    case "multi-select":
      if (Array.isArray(value)) return value.map((v) => String(v));
      return [String(value)];

    case "reference":
      return String(value);

    default:
      return value;
  }
}

/**
 * Apply default values to a set of field definitions
 */
export function applyDefaults(
  defs: CustomFieldDefinition[]
): Record<string, any> {
  const defaults: Record<string, any> = {};

  for (const def of defs) {
    if (def.defaultValue !== undefined) {
      defaults[def.name] = normalizeValue(def, def.defaultValue);
    }
  }

  return defaults;
}

/**
 * Get fields that can be used in filters
 */
export function filterableFields(
  defs: CustomFieldDefinition[]
): CustomFieldDefinition[] {
  return defs.filter(
    (def) =>
      def.visibility?.includes("filter") &&
      (def.type === "text" ||
        def.type === "number" ||
        def.type === "date" ||
        def.type === "boolean" ||
        def.type === "picklist")
  );
}

/**
 * Build filter predicates for custom fields (schema-gap stub)
 * 
 * Returns supported:false until CustomFieldValue table exists or
 * metadata JSON columns are available on entities.
 */
export function buildFilterPredicates(
  entityType: string,
  filters: Record<string, any>
): { supported: boolean; predicates?: any[]; reason?: string } {
  // Schema gap: no CustomFieldValue table or indexed metadata columns
  return {
    supported: false,
    reason: "Schema gap: CustomFieldValue table not available. Filtering by custom fields requires indexed storage.",
  };
}

