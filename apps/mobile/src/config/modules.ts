export type SubModule = { label: string; slug: string };
export type Module = { label: string; slug: string; sub: SubModule[] };
export const modules: Module[] = [
  { label: "Finance", slug: "finance", sub: [
    { label: "General Ledger", slug: "general-ledger" },
    { label: "Accounts Payable", slug: "accounts-payable" },
    { label: "Accounts Receivable", slug: "accounts-receivable" },
    { label: "Bank & Cash", slug: "bank-and-cash" },
    { label: "Bank Reconciliation", slug: "bank-reconciliation" },
    { label: "VAT (MTD)", slug: "vat-mtd" },
    { label: "Fixed Assets", slug: "fixed-assets" },
    { label: "Period Close", slug: "period-close" },
    { label: "FX Revaluation", slug: "fx-revaluation" },
    { label: "Costing", slug: "costing" }
  ]},
  { label: "HR & Payroll", slug: "hr-and-payroll", sub: [
    { label: "Payroll", slug: "payroll" },
    { label: "Employees", slug: "employees" }
  ]},
  { label: "Inventory & WMS", slug: "inventory-and-wms", sub: [
    { label: "Items & Lots", slug: "items-and-lots" },
    { label: "Warehouses", slug: "warehouses" },
    { label: "Stock Movements", slug: "stock-movements" },
    { label: "Advanced WMS (ASN, Wave, 3PL)", slug: "advanced-wms-asn-wave-3pl" },
    { label: "Cycle Counting", slug: "cycle-counting" },
    { label: "Quality (Holds & CAPA)", slug: "quality-holds-and-capa" }
  ]},
  { label: "Manufacturing", slug: "manufacturing", sub: [
    { label: "BOM & Routings", slug: "bom-and-routings" },
    { label: "Work Orders", slug: "work-orders" },
    { label: "MRP", slug: "mrp" },
    { label: "Capacity Planning", slug: "capacity-planning" },
    { label: "APS", slug: "aps" },
    { label: "Maintenance", slug: "maintenance" },
    { label: "PLM", slug: "plm" }
  ]},
  { label: "Sales & CRM", slug: "sales-and-crm", sub: [
    { label: "Leads & Opportunities", slug: "leads-and-opportunities" },
    { label: "Quotations & Sales Orders", slug: "quotations-and-sales-orders" },
    { label: "Returns (RMA)", slug: "returns-rma" },
    { label: "CRM Integrations", slug: "crm-integrations" },
    { label: "Marketplace", slug: "marketplace" }
  ]},
  { label: "Purchasing", slug: "purchasing", sub: [
    { label: "Requisitions", slug: "requisitions" },
    { label: "Purchase Orders", slug: "purchase-orders" },
    { label: "Supplier Invoices & Payments", slug: "supplier-invoices-and-payments" }
  ]},
  { label: "Projects", slug: "projects", sub: [
    { label: "Projects & Tasks", slug: "projects-and-tasks" },
    { label: "Costing & Billing", slug: "costing-and-billing" }
  ]},
  { label: "Compliance & Tax", slug: "compliance-and-tax", sub: [
    { label: "GDPR Tools & Audit", slug: "gdpr-tools-and-audit" },
    { label: "CIS", slug: "cis" }
  ]},
  { label: "Banking & Billing", slug: "banking-and-billing", sub: [
    { label: "Open Banking", slug: "open-banking" },
    { label: "Billing & Metering", slug: "billing-and-metering" },
    { label: "Stripe Payments", slug: "stripe-payments" }
  ]},
  { label: "Enterprise & Analytics", slug: "enterprise-and-analytics", sub: [
    { label: "Intercompany & Consolidation", slug: "intercompany-and-consolidation" },
    { label: "Multi-Currency & Multi-Entity", slug: "multi-currency-and-multi-entity" },
    { label: "Analytics & Dashboards", slug: "analytics-and-dashboards" },
    { label: "Observability & SIEM", slug: "observability-and-siem" }
  ]},
  { label: "AI & Automation", slug: "ai-and-automation", sub: [
    { label: "Nexa AI Assist", slug: "nexa-ai-assist" },
    { label: "OCR & Document AI", slug: "ocr-and-document-ai" },
    { label: "Predictive Scenarios", slug: "predictive-scenarios" },
    { label: "Workflows & Jobs", slug: "workflows-and-jobs" },
    { label: "Notifications", slug: "notifications" }
  ]},
  { label: "Mobile & PWA", slug: "mobile-and-pwa", sub: [
    { label: "Installable PWA", slug: "installable-pwa" },
    { label: "iOS & Android App", slug: "ios-and-android-app" },
    { label: "Offline Queue & Push", slug: "offline-queue-and-push" }
  ]},
  { label: "Settings & Connectors", slug: "settings-and-connectors", sub: [
    { label: "Connectors (Microsoft 365, Google Workspace, Stripe, TrueLayer, HMRC VAT, Twilio, Shopify, Amazon, eBay)", slug: "connectors-suite" },
    { label: "API Keys & Rate Limits", slug: "api-keys-and-rate-limits" },
    { label: "Backups & DR", slug: "backups-and-dr" }
  ]},
  { label: "Point of Sale (POS)", slug: "pos", sub: [
    { label: "Stripe Terminal Checkout", slug: "stripe-terminal-checkout" },
    { label: "Receipts (HTML/PDF)", slug: "receipts-html-pdf" },
    { label: "Offline Park→Sync", slug: "offline-park-to-sync" },
    { label: "Reconciliation", slug: "reconciliation" },
    { label: "Postings (toggle with POS_POSTING_ENABLED=true)", slug: "postings" },
    { label: "X/Z Reports", slug: "xz-reports" }
  ]},
  { label: "Help", slug: "help", sub: [] },
  { label: "Settings", slug: "settings", sub: [] }
];
