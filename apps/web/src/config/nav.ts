/**
 * Navigation Configuration
 * 
 * Single source of truth for all navigation items across Nexa ERP.
 * Each item includes label, href, icon (optional), and requiredPermission for RBAC.
 */

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  requiredPermission?: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  {
    label: "Finance",
    href: "/finance",
    icon: "💰",
    children: [
      { label: "General Ledger", href: "/finance/gl", requiredPermission: "finance:view_gl" },
      { label: "Accounts Payable", href: "/finance/ap", requiredPermission: "finance:view_ap" },
      { label: "Accounts Receivable", href: "/finance/ar", requiredPermission: "finance:view_ar" },
      { label: "Bank & Cash", href: "/finance/bank", requiredPermission: "finance:view_bank" },
      { label: "Banking", href: "/finance/banking", requiredPermission: "finance:view_bank" },
      { label: "Expenses", href: "/finance/expenses", requiredPermission: "finance:view_expenses" },
      { label: "Reconciliation", href: "/finance/reconciliation", requiredPermission: "finance:reconcile" },
      { label: "VAT (MTD)", href: "/finance/vat", requiredPermission: "finance:view_vat" },
      { label: "Fixed Assets", href: "/finance/fa", requiredPermission: "finance:view_fa" },
      { label: "Period Close", href: "/finance/close", requiredPermission: "finance:close_period" },
      { label: "FX Revaluation", href: "/finance/fx", requiredPermission: "finance:view_fx" },
      { label: "Invoices", href: "/finance/invoices", requiredPermission: "finance:view_invoices" },
      { label: "Bills", href: "/finance/bills", requiredPermission: "finance:view_bills" },
      { label: "Purchase Orders", href: "/finance/purchase-orders", requiredPermission: "finance:view_pos" },
      { label: "Payments", href: "/finance/payments", requiredPermission: "finance:view_payments" },
      { label: "Reports", href: "/finance/reports", requiredPermission: "finance:view_reports" },
    ],
  },
  {
    label: "Banking",
    href: "/banking",
    icon: "🏦",
    children: [
      { label: "Accounts", href: "/banking/accounts", requiredPermission: "banking:view_accounts" },
      { label: "Statements", href: "/banking/statements", requiredPermission: "banking:view_statements" },
      { label: "Reconciliation", href: "/banking/reconciliation", requiredPermission: "banking:reconcile" },
      { label: "Cash Forecast", href: "/banking/cash/forecast", requiredPermission: "banking:view_forecast" },
      { label: "Cash Position", href: "/banking/cash/position", requiredPermission: "banking:view_position" },
    ],
  },
  {
    label: "HR & Payroll",
    href: "/hr",
    icon: "👥",
    children: [
      { label: "Employees", href: "/hr/employees", requiredPermission: "hr:view_employees" },
      { label: "Payroll", href: "/hr/payroll", requiredPermission: "hr:view_payroll" },
      { label: "Payroll HMRC", href: "/hr/payroll/hmrc", requiredPermission: "hr:view_payroll" },
      { label: "Payslips", href: "/hr/payroll/payslips", requiredPermission: "hr:view_payslips" },
      { label: "Leave", href: "/hr/leave", requiredPermission: "hr:view_leave" },
      { label: "Recruitment", href: "/hr/recruitment", requiredPermission: "hr:view_recruitment" },
      { label: "Contracts", href: "/hr/contracts", requiredPermission: "hr:view_contracts" },
      { label: "Departments", href: "/hr/departments", requiredPermission: "hr:view_departments" },
      { label: "Timesheets", href: "/hr/timesheets", requiredPermission: "hr:view_timesheets" },
    ],
  },
  {
    label: "Inventory & WMS",
    href: "/inventory",
    icon: "📦",
    children: [
      { label: "Items", href: "/inventory/items", requiredPermission: "inventory:view_items" },
      { label: "Adjustments", href: "/inventory/adjustments", requiredPermission: "inventory:adjust" },
      { label: "Transfers", href: "/inventory/transfers", requiredPermission: "inventory:transfer" },
      { label: "Warehouses", href: "/inventory/warehouses", requiredPermission: "inventory:view_warehouses" },
      { label: "Categories", href: "/inventory/categories", requiredPermission: "inventory:view_categories" },
      { label: "Stock Movements", href: "/inventory/stock-movements", requiredPermission: "inventory:view_movements" },
      { label: "Stock", href: "/inventory/stock", requiredPermission: "inventory:view_stock" },
      { label: "Bins", href: "/inventory/bins", requiredPermission: "inventory:view_bins" },
      { label: "Fulfilment", href: "/inventory/fulfilment", requiredPermission: "inventory:view_fulfilment" },
      { label: "Cycle Count", href: "/inventory/cyclecount", requiredPermission: "inventory:cycle_count" },
      { label: "Variance", href: "/inventory/variance", requiredPermission: "inventory:view_variance" },
    ],
  },
  {
    label: "Manufacturing",
    href: "/manufacturing",
    icon: "🏭",
    children: [
      { label: "BOMs", href: "/manufacturing/boms", requiredPermission: "manufacturing:view_boms" },
      { label: "BOM", href: "/manufacturing/bom", requiredPermission: "manufacturing:view_boms" },
      { label: "Work Orders", href: "/manufacturing/work-orders", requiredPermission: "manufacturing:view_workorders" },
      { label: "Schedules", href: "/manufacturing/schedules", requiredPermission: "manufacturing:view_schedules" },
      { label: "MRP", href: "/manufacturing/mrp", requiredPermission: "manufacturing:view_mrp" },
      { label: "Resources", href: "/manufacturing/resources", requiredPermission: "manufacturing:view_resources" },
      { label: "Routing", href: "/manufacturing/routing", requiredPermission: "manufacturing:view_routing" },
      { label: "Routings", href: "/manufacturing/routings", requiredPermission: "manufacturing:view_routing" },
      { label: "Work Centers", href: "/manufacturing/workcenters", requiredPermission: "manufacturing:view_workcenters" },
    ],
  },
  {
    label: "Purchasing",
    href: "/purchasing",
    icon: "🛒",
    children: [
      { label: "Suppliers", href: "/purchasing/suppliers", requiredPermission: "purchasing:view_suppliers" },
      { label: "Purchase Orders", href: "/purchasing/orders", requiredPermission: "purchasing:view_pos" },
      { label: "PO", href: "/purchasing/po", requiredPermission: "purchasing:view_pos" },
      { label: "Receipts", href: "/purchasing/receipts", requiredPermission: "purchasing:view_receipts" },
      { label: "Blanket Orders", href: "/purchasing/blanket", requiredPermission: "purchasing:view_blanket" },
      { label: "Contracts", href: "/purchasing/contracts", requiredPermission: "purchasing:view_contracts" },
      { label: "Landed Cost", href: "/purchasing/landed", requiredPermission: "purchasing:view_landed" },
      { label: "Performance", href: "/purchasing/performance", requiredPermission: "purchasing:view_performance" },
    ],
  },
  {
    label: "Sales & CRM",
    href: "/sales",
    icon: "📈",
    children: [
      { label: "Leads", href: "/sales/leads", requiredPermission: "sales:view_leads" },
      { label: "Opportunities", href: "/sales/opportunities", requiredPermission: "sales:view_opportunities" },
      { label: "Quotes", href: "/sales/quotes", requiredPermission: "sales:view_quotes" },
      { label: "Orders", href: "/sales/orders", requiredPermission: "sales:view_orders" },
      { label: "Customers", href: "/sales/customers", requiredPermission: "sales:view_customers" },
      { label: "Chains", href: "/sales/chains", requiredPermission: "sales:view_chains" },
    ],
  },
  {
    label: "CRM",
    href: "/crm",
    icon: "📊",
    children: [
      { label: "Accounts", href: "/crm/accounts", requiredPermission: "crm:view_accounts" },
      { label: "Contacts", href: "/crm/contacts", requiredPermission: "crm:view_contacts" },
      { label: "Activities", href: "/crm/activities", requiredPermission: "crm:view_activities" },
      { label: "Pipelines", href: "/crm/pipelines", requiredPermission: "crm:view_pipelines" },
    ],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: "📋",
    children: [
      { label: "Boards", href: "/projects/boards", requiredPermission: "projects:view_boards" },
      { label: "Board", href: "/projects/board", requiredPermission: "projects:view_boards" },
      { label: "Tasks", href: "/projects/tasks", requiredPermission: "projects:view_tasks" },
      { label: "Timesheets", href: "/projects/timesheets", requiredPermission: "projects:view_timesheets" },
      { label: "Projects", href: "/projects/projects", requiredPermission: "projects:view_projects" },
      { label: "Phases", href: "/projects/phases", requiredPermission: "projects:view_phases" },
      { label: "Time", href: "/projects/time", requiredPermission: "projects:view_time" },
      { label: "Analytics", href: "/projects/analytics", requiredPermission: "projects:view_analytics" },
      { label: "Billing", href: "/projects/billing", requiredPermission: "projects:view_billing" },
      { label: "Retainers", href: "/projects/retainers", requiredPermission: "projects:view_retainers" },
    ],
  },
  {
    label: "POS",
    href: "/pos",
    icon: "💳",
    children: [
      { label: "Register", href: "/pos/register", requiredPermission: "pos:use_register" },
      { label: "Receipts", href: "/pos/receipts", requiredPermission: "pos:view_receipts" },
      { label: "Products", href: "/pos/products", requiredPermission: "pos:view_products" },
      { label: "Sessions", href: "/pos/sessions", requiredPermission: "pos:view_sessions" },
      { label: "Cashup", href: "/pos/cashup", requiredPermission: "pos:view_cashup" },
      { label: "Promotions", href: "/pos/promotions", requiredPermission: "pos:view_promotions" },
      { label: "Reports", href: "/pos/reports", requiredPermission: "pos:view_reports" },
      { label: "Variance", href: "/pos/variance", requiredPermission: "pos:view_variance" },
    ],
  },
  {
    label: "Planning / S&OP",
    href: "/planning/overview",
    icon: "📅",
    requiredPermission: "ui:planning:view",
    children: [
      { label: "Overview", href: "/planning/overview", requiredPermission: "ui:planning:view" },
      { label: "Demand", href: "/planning/demand", requiredPermission: "ui:planning:view" },
      { label: "Supply", href: "/planning/supply", requiredPermission: "ui:planning:view" },
      { label: "Recommendations", href: "/planning/recommendations", requiredPermission: "ui:planning:view" },
      { label: "Capacity", href: "/planning/capacity", requiredPermission: "ui:planning:view" },
    ],
  },
  {
    label: "Tax",
    href: "/tax",
    icon: "📊",
    children: [
      { label: "VAT Returns", href: "/tax/vat", requiredPermission: "tax:view_vat" },
      { label: "HMRC MTD", href: "/tax/hmrc-mtd", requiredPermission: "tax:view_hmrc" },
      { label: "Audit Pack", href: "/tax/audit-pack", requiredPermission: "tax:view_audit" },
      { label: "GCC eInvoice", href: "/tax/gcc-einvoice", requiredPermission: "tax:view_gcc" },
    ],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "📊",
    children: [
      { label: "Dashboard", href: "/analytics/dashboard", requiredPermission: "analytics:view" },
      { label: "Overview", href: "/analytics/overview", requiredPermission: "analytics:view" },
      { label: "Snapshots", href: "/analytics/snapshots", requiredPermission: "analytics:view" },
    ],
  },
  {
    label: "AI",
    href: "/ai",
    icon: "🤖",
    children: [
      { label: "Overview", href: "/ai/overview", requiredPermission: "ai:view" },
      { label: "Assistant", href: "/ai/assistant", requiredPermission: "ai:use_assistant" },
      { label: "Automations", href: "/ai/automations", requiredPermission: "ai:view" },
      { label: "Workbench", href: "/ai/workbench", requiredPermission: "ai:view" },
      { label: "Logs", href: "/ai/logs", requiredPermission: "ai:view" },
    ],
  },
  {
    label: "Healthcare",
    href: "/healthcare",
    icon: "🏥",
    children: [
      { label: "Overview", href: "/healthcare/overview", requiredPermission: "healthcare:view" },
      { label: "Claims", href: "/healthcare/claims", requiredPermission: "healthcare:view_claims" },
      { label: "PCN", href: "/healthcare/pcn", requiredPermission: "healthcare:view_pcn" },
      { label: "Practices", href: "/healthcare/practices", requiredPermission: "healthcare:view_practices" },
      { label: "Reports", href: "/healthcare/reports", requiredPermission: "healthcare:view_reports" },
      { label: "Rota", href: "/healthcare/rota", requiredPermission: "healthcare:view_rota" },
    ],
  },
  {
    label: "Import/Export",
    href: "/import-export",
    icon: "📥",
    requiredPermission: "import:use",
  },
  {
    label: "Attachments",
    href: "/attachments",
    icon: "📎",
    requiredPermission: "attachments:view",
  },
  {
    label: "Ops",
    href: "/ops",
    icon: "⚙️",
    children: [
      { label: "Observability", href: "/ops/observability", requiredPermission: "ops:view_observability" },
    ],
  },
  {
    label: "AI",
    href: "/ai",
    icon: "🤖",
    children: [
      { label: "Agent Console", href: "/agent/overview", requiredPermission: "ui:ai:admin" },
      { label: "Agent Runs", href: "/agent/runs", requiredPermission: "ui:ai:admin" },
    ],
  },
  {
    label: "Super Admin",
    href: "/super-admin/tenants",
    icon: "👑",
    requiredPermission: "ui:superadmin:portal",
    children: [
      { label: "Tenants", href: "/super-admin/tenants", requiredPermission: "ui:superadmin:portal" },
    ],
  },
  {
    label: "Admin",
    href: "/admin",
    icon: "🔧",
    children: [
      { label: "Security", href: "/admin/security", requiredPermission: "admin:view_security" },
      { label: "Configuration", href: "/admin/config", requiredPermission: "admin:view_config" },
      { label: "COA Templates", href: "/admin/coa-templates", requiredPermission: "admin:view_coa" },
      { label: "Industry Presets", href: "/admin/industry-presets", requiredPermission: "admin:view_presets" },
      { label: "Localisation", href: "/admin/localisation", requiredPermission: "admin:view_localisation" },
      { label: "Custom Fields", href: "/admin/custom-fields", requiredPermission: "ui:customfields:view" },
      { label: "Users", href: "/admin/users", requiredPermission: "ui:admin:users" },
      { label: "RBAC", href: "/admin/rbac", requiredPermission: "ui:admin:rbac" },
    ],
  },
  {
    label: "Workflow",
    href: "/workflow",
    icon: "⚙️",
    requiredPermission: "ui:workflow:view",
    children: [
      { label: "Overview", href: "/workflow/overview", requiredPermission: "ui:workflow:view" },
    ],
  },
  {
    label: "Partners",
    href: "/partner",
    icon: "🤝",
    children: [
      { label: "Overview", href: "/partner/overview", requiredPermission: "partners:view" },
    ],
  },
  {
    label: "Costing",
    href: "/costing",
    icon: "💰",
    requiredPermission: "costing:view",
  },
];

