export type AppModule = {
  id: string;
  title: string;
  path: string;
  children?: AppModule[];
};

export const appModules: AppModule[] = [
  { id: "dashboard", title: "Dashboard", path: "/dashboard" },
  { id: "finance", title: "Finance", path: "/finance" },
  { id: "hr-payroll", title: "HR & Payroll", path: "/hr-payroll" },
  { id: "inventory-wms", title: "Inventory & WMS", path: "/inventory" },
  { id: "manufacturing", title: "Manufacturing", path: "/industry/manufacturing" },
  { id: "sales-crm", title: "Sales & CRM", path: "/sales-crm" },
  { id: "purchasing", title: "Purchasing", path: "/purchasing" },
  { id: "projects", title: "Projects", path: "/projects" },
  { id: "compliance-tax", title: "Compliance & Tax", path: "/compliance" },
  { id: "banking-billing", title: "Banking & Billing", path: "/banking-billing" },
  { id: "enterprise-analytics", title: "Enterprise & Analytics", path: "/enterprise" },
  { id: "ai-automation", title: "AI & Automation", path: "/ai" },
  { id: "mobile-pwa", title: "Mobile & PWA", path: "/mobile" },
  { id: "settings-connectors", title: "Settings & Connectors", path: "/settings/connectors" },
  { id: "pos", title: "POS", path: "/pos" },
  { id: "help", title: "Help", path: "/help" },
  { id: "settings", title: "Settings", path: "/settings" }
];

export default appModules;
