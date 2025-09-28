type RouteMap = Record<string, string>;
export const actionRoutes: RouteMap = {
  "invoice:new": "/modules/finance/invoices/new",
  "invoice:list": "/modules/finance/invoices",
  "po:new": "/modules/purchasing/purchase-orders/new",
  "po:list": "/modules/purchasing/purchase-orders",
  "so:new": "/modules/sales-crm/sales-orders/new",
  "so:list": "/modules/sales-crm/sales-orders",
  "product:new": "/modules/inventory-wms/products/new",
  "product:list": "/modules/inventory-wms/products",
  "project:new": "/modules/projects/new",
  "project:list": "/modules/projects",
  "employee:new": "/modules/hr-payroll/employees/new",
  "employee:list": "/modules/hr-payroll/employees",
};
export function routeForAction(actionSlug: string): string | null {
  return actionRoutes[actionSlug] ?? null;
}
