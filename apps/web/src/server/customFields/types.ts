/**
 * Phase 25 — Custom Fields Engine Types
 * 
 * Core type definitions for the custom fields engine.
 */

/**
 * Custom field type union
 */
export type CustomFieldType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "picklist"
  | "multi-select"
  | "reference";

/**
 * Custom field definition
 */
export interface CustomFieldDefinition {
  id: string;
  tenantId?: string; // Optional: tenant-specific override
  entityType: string; // e.g. "finance.invoice", "purchasing.supplier"
  name: string; // Internal name (e.g. "cf_invoice_source")
  label: string; // Display label (e.g. "Invoice Source")
  type: CustomFieldType;
  required?: boolean;
  options?: string[]; // For picklist and multi-select
  defaultValue?: any;
  helpText?: string;
  order?: number; // Display order
  visibility?: ("detail" | "list" | "filter")[]; // Where this field appears
}

/**
 * Custom field value
 */
export interface CustomFieldValue {
  fieldId: string; // References CustomFieldDefinition.id
  entityType: string;
  entityId: string;
  rawValue: any; // Raw value as stored
  normalizedValue: any; // Normalized value (e.g. date as Date object, number as number)
}

/**
 * Custom field layout (for UI grouping)
 */
export interface CustomFieldLayout {
  entityType: string;
  sections: Array<{
    id: string;
    label: string;
    fields: string[]; // Array of field IDs
    order: number;
  }>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

