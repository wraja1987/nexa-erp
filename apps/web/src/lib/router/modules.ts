export type Sub={slug:string;label:string}
export type Mod={slug:string;label:string;subs:Sub[]}
export const modules:Mod[]=[
  {
    "slug": "dashboard",
    "label": "Dashboard",
    "subs": []
  },
  {
    "slug": "ai-automation",
    "label": "AI & Automation",
    "subs": [
      {
        "slug": "nexa-ai-assist",
        "label": "Nexa AI Assist"
      },
      {
        "slug": "ocr-document-ai",
        "label": "OCR & Document AI"
      },
      {
        "slug": "predictive-scenarios",
        "label": "Predictive Scenarios"
      },
      {
        "slug": "workflows-jobs",
        "label": "Workflows & Jobs"
      },
      {
        "slug": "notifications",
        "label": "Notifications"
      }
    ]
  },
  {
    "slug": "banking-billing",
    "label": "Banking & Billing",
    "subs": [
      {
        "slug": "open-banking",
        "label": "Open Banking"
      },
      {
        "slug": "billing-metering",
        "label": "Billing & Metering"
      },
      {
        "slug": "stripe-payments",
        "label": "Stripe Payments"
      }
    ]
  },
  {
    "slug": "compliance-tax",
    "label": "Compliance & Tax",
    "subs": [
      {
        "slug": "gdpr-tools-audit",
        "label": "GDPR Tools & Audit"
      },
      {
        "slug": "cis",
        "label": "CIS (Construction Industry Scheme)"
      }
    ]
  },
  {
    "slug": "core",
    "label": "Core",
    "subs": [
      {
        "slug": "dashboard",
        "label": "Dashboard"
      },
      {
        "slug": "users-roles",
        "label": "Users & Roles (RBAC / SoD)"
      },
      {
        "slug": "tenant-settings",
        "label": "Tenant & Settings"
      },
      {
        "slug": "help-docs",
        "label": "Help & Docs"
      }
    ]
  },
  {
    "slug": "enterprise-analytics",
    "label": "Enterprise & Analytics",
    "subs": [
      {
        "slug": "intercompany-consolidation",
        "label": "Intercompany & Consolidation"
      },
      {
        "slug": "multi-currency-entity",
        "label": "Multi-Currency & Multi-Entity"
      },
      {
        "slug": "analytics-dashboards",
        "label": "Analytics & Dashboards"
      },
      {
        "slug": "observability-siem",
        "label": "Observability & SIEM"
      }
    ]
  },
  {
    "slug": "finance",
    "label": "Finance",
    "subs": [
      {
        "slug": "general-ledger",
        "label": "General Ledger"
      },
      {
        "slug": "accounts-payable",
        "label": "Accounts Payable"
      },
      {
        "slug": "accounts-receivable",
        "label": "Accounts Receivable"
      },
      {
        "slug": "bank-cash",
        "label": "Bank & Cash"
      },
      {
        "slug": "bank-reconciliation",
        "label": "Bank Reconciliation"
      },
      {
        "slug": "vat-mtd",
        "label": "VAT (MTD)"
      },
      {
        "slug": "fixed-assets",
        "label": "Fixed Assets"
      },
      {
        "slug": "period-close",
        "label": "Period Close"
      },
      {
        "slug": "fx-revaluation",
        "label": "FX Revaluation"
      },
      {
        "slug": "costing",
        "label": "Costing"
      }
    ]
  },
  {
    "slug": "hr-payroll",
    "label": "HR & Payroll",
    "subs": [
      {
        "slug": "payroll",
        "label": "Payroll"
      },
      {
        "slug": "employees",
        "label": "Employees"
      }
    ]
  },
  {
    "slug": "inventory-wms",
    "label": "Inventory & WMS",
    "subs": [
      {
        "slug": "items-lots",
        "label": "Items & Lots"
      },
      {
        "slug": "warehouses",
        "label": "Warehouses"
      },
      {
        "slug": "stock-movements",
        "label": "Stock Movements"
      },
      {
        "slug": "advanced-wms",
        "label": "Advanced WMS (ASN, Wave, 3PL)"
      },
      {
        "slug": "cycle-counting",
        "label": "Cycle Counting"
      },
      {
        "slug": "quality-capa",
        "label": "Quality (Holds & CAPA)"
      }
    ]
  },
  {
    "slug": "manufacturing",
    "label": "Manufacturing",
    "subs": [
      {
        "slug": "bom-routings",
        "label": "BOM & Routings"
      },
      {
        "slug": "work-orders",
        "label": "Work Orders"
      },
      {
        "slug": "mrp",
        "label": "MRP"
      },
      {
        "slug": "capacity-planning",
        "label": "Capacity Planning"
      },
      {
        "slug": "aps",
        "label": "APS"
      },
      {
        "slug": "maintenance",
        "label": "Maintenance"
      },
      {
        "slug": "plm",
        "label": "PLM"
      }
    ]
  },
  {
    "slug": "mobile-pwa",
    "label": "Mobile & PWA",
    "subs": [
      {
        "slug": "installable-pwa",
        "label": "Installable PWA"
      },
      {
        "slug": "ios-android-app",
        "label": "iOS & Android App"
      }
    ]
  },
  {
    "slug": "pos",
    "label": "POS",
    "subs": [
      {
        "slug": "pos",
        "label": "Point of Sale (POS)"
      }
    ]
  },
  {
    "slug": "projects",
    "label": "Projects",
    "subs": [
      {
        "slug": "projects-tasks",
        "label": "Projects & Tasks"
      },
      {
        "slug": "costing-billing",
        "label": "Costing & Billing"
      }
    ]
  },
  {
    "slug": "purchasing",
    "label": "Purchasing",
    "subs": [
      {
        "slug": "requisitions",
        "label": "Requisitions"
      },
      {
        "slug": "purchase-orders",
        "label": "Purchase Orders"
      },
      {
        "slug": "supplier-invoices-payments",
        "label": "Supplier Invoices & Payments"
      }
    ]
  },
  {
    "slug": "sales-crm",
    "label": "Sales & CRM",
    "subs": [
      {
        "slug": "leads-opportunities",
        "label": "Leads & Opportunities"
      },
      {
        "slug": "quotations-sales-orders",
        "label": "Quotations & Sales Orders"
      },
      {
        "slug": "returns-rma",
        "label": "Returns (RMA)"
      }
    ]
  },
  {
    "slug": "settings-connectors",
    "label": "Settings & Connectors",
    "subs": [
      {
        "slug": "connectors",
        "label": "Connectors"
      },
      {
        "slug": "api-keys-rate-limits",
        "label": "API Keys & Rate Limits"
      },
      {
        "slug": "backups-dr",
        "label": "Backups & DR"
      }
    ]
  }
];
