/**
 * Import Row Type Definitions
 * Defines TypeScript types for each import row type.
 */

export type ImportValidationError = {
  row: number; // 1-based row number (header is row 0)
  field?: string;
  message: string;
};

export type OpeningBalanceRow = {
  originalRowNumber: number;
  accountCode: string;
  debit: number;
  credit: number;
};

export type CoaRow = {
  originalRowNumber: number;
  code: string;
  name: string;
  type?: string; // asset, liability, equity, revenue, expense
  currency?: string;
  parentCode?: string;
  active?: boolean;
};

export type CustomerRow = {
  originalRowNumber: number;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type VendorRow = {
  originalRowNumber: number;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type ItemRow = {
  originalRowNumber: number;
  sku: string;
  name?: string;
  qtyOnHand: number;
  warehouseCode?: string;
  locationCode?: string;
};

export type PriceListRow = {
  originalRowNumber: number;
  priceListCode: string;
  sku: string;
  price: number;
  currency?: string;
};

export type PurchaseOrderRow = {
  originalRowNumber: number;
  number: string;
  supplierCode: string;
  orderDate: string; // ISO date string
  expectedDate?: string; // ISO date string
  currency?: string;
  lines: PurchaseOrderLineRow[];
};

export type PurchaseOrderLineRow = {
  sku: string;
  qty: number;
  price: number;
};

export type SalesOrderRow = {
  originalRowNumber: number;
  number: string;
  customerCode: string;
  orderDate: string; // ISO date string
  currency?: string;
  lines: SalesOrderLineRow[];
};

export type SalesOrderLineRow = {
  sku: string;
  qty: number;
  price: number;
};

export type PayrollRow = {
  originalRowNumber: number;
  runId?: string;
  employeeNo: string;
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
  grossPay: number;
  netPay: number;
};

