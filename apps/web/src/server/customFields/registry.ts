/**
 * Phase 25 — Custom Fields Registry
 * 
 * Hard-coded default custom field definitions per entity type.
 * In future, these will be loaded from CustomFieldDefinition table.
 */

import type { CustomFieldDefinition } from "./types";

/**
 * Finance Invoice Custom Fields
 */
const financeInvoiceFields: CustomFieldDefinition[] = [
  {
    id: "cf_invoice_source",
    entityType: "finance.invoice",
    name: "cf_invoice_source",
    label: "Invoice Source",
    type: "picklist",
    required: false,
    options: ["Online", "Phone", "In-person", "Email"],
    order: 1,
    visibility: ["detail", "list"],
  },
  {
    id: "cf_invoice_campaign",
    entityType: "finance.invoice",
    name: "cf_invoice_campaign",
    label: "Campaign",
    type: "text",
    required: false,
    order: 2,
    visibility: ["detail"],
  },
  {
    id: "cf_invoice_priority",
    entityType: "finance.invoice",
    name: "cf_invoice_priority",
    label: "Priority",
    type: "picklist",
    required: false,
    options: ["Low", "Normal", "High", "Urgent"],
    defaultValue: "Normal",
    order: 3,
    visibility: ["detail", "list", "filter"],
  },
];

/**
 * Purchasing Supplier Custom Fields
 */
const purchasingSupplierFields: CustomFieldDefinition[] = [
  {
    id: "cf_supplier_category",
    entityType: "purchasing.supplier",
    name: "cf_supplier_category",
    label: "Category",
    type: "picklist",
    required: false,
    options: ["Raw Materials", "Services", "Equipment", "Consumables", "Other"],
    order: 1,
    visibility: ["detail", "list", "filter"],
  },
  {
    id: "cf_supplier_risk_score",
    entityType: "purchasing.supplier",
    name: "cf_supplier_risk_score",
    label: "Risk Score",
    type: "number",
    required: false,
    defaultValue: 0,
    helpText: "Risk score from 0-100",
    order: 2,
    visibility: ["detail"],
  },
  {
    id: "cf_supplier_certified",
    entityType: "purchasing.supplier",
    name: "cf_supplier_certified",
    label: "Certified Supplier",
    type: "boolean",
    required: false,
    defaultValue: false,
    order: 3,
    visibility: ["detail", "list"],
  },
];

/**
 * Inventory Item Custom Fields
 */
const inventoryItemFields: CustomFieldDefinition[] = [
  {
    id: "cf_item_brand",
    entityType: "inventory.item",
    name: "cf_item_brand",
    label: "Brand",
    type: "text",
    required: false,
    order: 1,
    visibility: ["detail", "list", "filter"],
  },
  {
    id: "cf_item_family",
    entityType: "inventory.item",
    name: "cf_item_family",
    label: "Product Family",
    type: "text",
    required: false,
    order: 2,
    visibility: ["detail", "list"],
  },
  {
    id: "cf_item_warranty_months",
    entityType: "inventory.item",
    name: "cf_item_warranty_months",
    label: "Warranty (Months)",
    type: "number",
    required: false,
    defaultValue: 12,
    order: 3,
    visibility: ["detail"],
  },
];

/**
 * HR Employee Custom Fields
 */
const hrEmployeeFields: CustomFieldDefinition[] = [
  {
    id: "cf_employee_grade",
    entityType: "hr.employee",
    name: "cf_employee_grade",
    label: "Grade",
    type: "picklist",
    required: false,
    options: ["A", "B", "C", "D", "E"],
    order: 1,
    visibility: ["detail", "list", "filter"],
  },
  {
    id: "cf_employee_skillset",
    entityType: "hr.employee",
    name: "cf_employee_skillset",
    label: "Skillset",
    type: "multi-select",
    required: false,
    options: ["Sales", "Marketing", "Engineering", "Support", "Management", "Operations"],
    order: 2,
    visibility: ["detail"],
  },
  {
    id: "cf_employee_start_date",
    entityType: "hr.employee",
    name: "cf_employee_start_date",
    label: "Start Date",
    type: "date",
    required: false,
    order: 3,
    visibility: ["detail", "list"],
  },
];

/**
 * Manufacturing Work Order Custom Fields
 */
const manufacturingWorkOrderFields: CustomFieldDefinition[] = [
  {
    id: "cf_wo_priority",
    entityType: "manufacturing.workorder",
    name: "cf_wo_priority",
    label: "Priority",
    type: "picklist",
    required: false,
    options: ["Low", "Normal", "High", "Urgent"],
    defaultValue: "Normal",
    order: 1,
    visibility: ["detail", "list", "filter"],
  },
  {
    id: "cf_wo_notes",
    entityType: "manufacturing.workorder",
    name: "cf_wo_notes",
    label: "Production Notes",
    type: "text",
    required: false,
    order: 2,
    visibility: ["detail"],
  },
];

/**
 * Registry of custom field definitions
 */
const REGISTRY: Record<string, CustomFieldDefinition[]> = {
  "finance.invoice": financeInvoiceFields,
  "purchasing.supplier": purchasingSupplierFields,
  "purchasing.po": [], // No default fields for POs yet
  "inventory.item": inventoryItemFields,
  "hr.employee": hrEmployeeFields,
  "manufacturing.workorder": manufacturingWorkOrderFields,
  "finance.entity": [], // EntityExt - no default fields
};

/**
 * Get default definitions for an entity type
 */
export function getDefaultDefinitions(entityType: string): CustomFieldDefinition[] {
  return REGISTRY[entityType] || [];
}

/**
 * List all supported entity types
 */
export function listSupportedEntityTypes(): string[] {
  return Object.keys(REGISTRY);
}

/**
 * Get a specific definition by ID
 */
export function getDefinitionById(
  entityType: string,
  fieldId: string
): CustomFieldDefinition | undefined {
  const defs = getDefaultDefinitions(entityType);
  return defs.find((d) => d.id === fieldId);
}

