// Nexa Modules Generator v2 (enhanced KPIs/Links/Insights/Tables)
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"

// Folders
const ROOT = process.cwd()
const PUBLIC_DIR = join(ROOT, "apps/web/public/modules")
const APP_DIR = join(ROOT, "apps/web/src/app/app")
const SIDEBAR_FILE = join(ROOT, "apps/web/src/lib/router/modules.ts")

// Spec types
type SubSpec = { title: string; preset: string }
type ModSpec = { title: string; preset: string; subs: Record<string, SubSpec> | [] }
type Spec = Record<string, ModSpec>

// Source of truth mapping (kebab-case slugs). Keep titles exactly as desired in sidebar.
const spec: Spec = {
  "dashboard": { title: "Dashboard", subs: [], preset: "dashboard" },

  "ai-automation": {
    title: "AI & Automation",
    subs: {
      "nexa-ai-assist": { title: "Nexa AI Assist", preset: "assist" },
      "ocr-document-ai": { title: "OCR & Document AI", preset: "uploader" },
      "predictive-scenarios": { title: "Predictive Scenarios", preset: "scenario-table" },
      "workflows-jobs": { title: "Workflows & Jobs", preset: "workflow-table" },
      "notifications": { title: "Notifications", preset: "list-rules" },
    },
    preset: "ai-hub",
  },

  "banking-billing": {
    title: "Banking & Billing",
    subs: {
      "open-banking": { title: "Open Banking", preset: "bank-feeds" },
      "billing-metering": { title: "Billing & Metering", preset: "plans-meters" },
      "stripe-payments": { title: "Stripe Payments", preset: "payments" },
    },
    preset: "banking-overview",
  },

  "compliance-tax": {
    title: "Compliance & Tax",
    subs: {
      "gdpr-tools-audit": { title: "GDPR Tools & Audit", preset: "audit-log" },
      "cis": { title: "CIS (Construction Industry Scheme)", preset: "cis-reports" },
    },
    preset: "compliance-overview",
  },

  "core": {
    title: "Core",
    subs: {
      "dashboard": { title: "Dashboard", preset: "dashboard" },
      "users-roles": { title: "Users & Roles (RBAC / SoD)", preset: "rbac" },
      "tenant-settings": { title: "Tenant & Settings", preset: "settings" },
      "help-docs": { title: "Help & Docs", preset: "help" },
    },
    preset: "core-overview",
  },

  "enterprise-analytics": {
    title: "Enterprise & Analytics",
    subs: {
      "intercompany-consolidation": { title: "Intercompany & Consolidation", preset: "consolidation" },
      "multi-currency-entity": { title: "Multi-Currency & Multi-Entity", preset: "multi-entity" },
      "analytics-dashboards": { title: "Analytics & Dashboards", preset: "analytics" },
      "observability-siem": { title: "Observability & SIEM", preset: "siem" },
    },
    preset: "enterprise-overview",
  },

  "finance": {
    title: "Finance",
    subs: {
      "general-ledger": { title: "General Ledger", preset: "gl" },
      "accounts-payable": { title: "Accounts Payable", preset: "ap" },
      "accounts-receivable": { title: "Accounts Receivable", preset: "ar" },
      "bank-cash": { title: "Bank & Cash", preset: "bank-cash" },
      "bank-reconciliation": { title: "Bank Reconciliation", preset: "recon" },
      "vat-mtd": { title: "VAT (MTD)", preset: "vat" },
      "fixed-assets": { title: "Fixed Assets", preset: "fa" },
      "period-close": { title: "Period Close", preset: "close" },
      "fx-revaluation": { title: "FX Revaluation", preset: "fx" },
      "costing": { title: "Costing", preset: "costing" },
    },
    preset: "finance-overview",
  },

  "hr-payroll": {
    title: "HR & Payroll",
    subs: {
      "payroll": { title: "Payroll", preset: "payroll" },
      "employees": { title: "Employees", preset: "employees" },
    },
    preset: "hr-overview",
  },

  "inventory-wms": {
    title: "Inventory & WMS",
    subs: {
      "items-lots": { title: "Items & Lots", preset: "items" },
      "warehouses": { title: "Warehouses", preset: "wh" },
      "stock-movements": { title: "Stock Movements", preset: "moves" },
      "advanced-wms": { title: "Advanced WMS (ASN, Wave, 3PL)", preset: "advanced-wms" },
      "cycle-counting": { title: "Cycle Counting", preset: "cycle" },
      "quality-capa": { title: "Quality (Holds & CAPA)", preset: "quality" },
    },
    preset: "wms-overview",
  },

  "manufacturing": {
    title: "Manufacturing",
    subs: {
      "bom-routings": { title: "BOM & Routings", preset: "bom" },
      "work-orders": { title: "Work Orders", preset: "wo" },
      "mrp": { title: "MRP", preset: "mrp" },
      "capacity-planning": { title: "Capacity Planning", preset: "capacity" },
      "aps": { title: "APS", preset: "aps" },
      "maintenance": { title: "Maintenance", preset: "maintenance" },
      "plm": { title: "PLM", preset: "plm" },
    },
    preset: "mfg-overview",
  },

  "mobile-pwa": {
    title: "Mobile & PWA",
    subs: {
      "installable-pwa": { title: "Installable PWA", preset: "pwa" },
      "ios-android-app": { title: "iOS & Android App", preset: "mobile" },
    },
    preset: "mobile-overview",
  },

  "pos": {
    title: "POS",
    subs: {
      "pos": { title: "Point of Sale (POS)", preset: "pos" },
    },
    preset: "pos-overview",
  },

  "projects": {
    title: "Projects",
    subs: {
      "projects-tasks": { title: "Projects & Tasks", preset: "projects" },
      "costing-billing": { title: "Costing & Billing", preset: "proj-billing" },
    },
    preset: "projects-overview",
  },

  "purchasing": {
    title: "Purchasing",
    subs: {
      "requisitions": { title: "Requisitions", preset: "req" },
      "purchase-orders": { title: "Purchase Orders", preset: "po" },
      "supplier-invoices-payments": { title: "Supplier Invoices & Payments", preset: "sip" },
    },
    preset: "purch-overview",
  },

  "sales-crm": {
    title: "Sales & CRM",
    subs: {
      "leads-opportunities": { title: "Leads & Opportunities", preset: "leads" },
      "quotations-sales-orders": { title: "Quotations & Sales Orders", preset: "so" },
      "returns-rma": { title: "Returns (RMA)", preset: "rma" },
    },
    preset: "sales-overview",
  },

  "settings-connectors": {
    title: "Settings & Connectors",
    subs: {
      "connectors": { title: "Connectors", preset: "connectors" },
      "api-keys-rate-limits": { title: "API Keys & Rate Limits", preset: "apikeys" },
      "backups-dr": { title: "Backups & DR", preset: "backups" },
    },
    preset: "settings-overview",
  },
} as const

// Sidebar order (strict)
const ORDER = [
  "dashboard",
  "ai-automation",
  "banking-billing",
  "compliance-tax",
  "core",
  "enterprise-analytics",
  "finance",
  "hr-payroll",
  "inventory-wms",
  "manufacturing",
  "mobile-pwa",
  "pos",
  "projects",
  "purchasing",
  "sales-crm",
  "settings-connectors",
] as const

function ensureDir(p: string) { if (!existsSync(p)) mkdirSync(p, { recursive: true }) }

function titleFromSlug(slug: string) {
  const known = spec[slug as keyof typeof spec]
  if (known) return known.title
  return slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

// Build JSON by preset
function makeJson(moduleSlug: string, title: string, preset: string, crumbs: string[]) {
  const base: any = {
    module: moduleSlug,
    title,
    breadcrumbs: crumbs,
    layout: { grid: [
      { area: "kpis", row: 1, col: 1, colSpan: 12 },
      { area: "insights", row: 2, col: 1, colSpan: 8 },
      { area: "quickLinks", row: 2, col: 9, colSpan: 4 },
      { area: "data", row: 3, col: 1, colSpan: 12 },
      { area: "aiEngine", row: 4, col: 1, colSpan: 12 },
    ]},
    aiEngine: { title: "AI Engine", placeholder: `Ask about ${title}…`, endpoint: "/api/ai/engine" },
    kpis: [],
    insights: { title: "AI Insights", items: [] },
    quickLinks: { title: "Quick Links", items: [] },
  }
  const add = (obj: any) => Object.assign(base, obj)
  switch (preset) {
    // MODULE OVERVIEWS
    case "banking-overview":
      add({
        kpis: [
          { id: "connected", label: "Connected Accounts", value: 3 },
          { id: "last-sync", label: "Last Sync (h)", value: 2 },
          { id: "balance", label: "Balance", value: 842000, currency: "GBP" },
        ],
        insights: { title: "AI Insights", items: [{ id: "bb1", icon: "RefreshCw", message: "Two bank feeds are stale (last synced > 24h).", tags: ["Banking"], severity: "warning" }] },
        table: { title: "Bank Feeds", columns: ["Account","Bank","Status","Last Sync"], rows: [["Main","HSBC","OK","10:00"],["Ops","Barclays","OK","09:00"],["Savings","NatWest","STALE",">24h"]] },
        quickLinks: { title: "Quick Links", items: [{ id: "connect", label: "Connect Account", href: "/app/banking-billing/open-banking" },{ id: "refresh", label: "Refresh Feeds", href: "/app/banking-billing/open-banking" }] }
      })
      break
    case "compliance-overview":
      add({
        kpis: [ { id: "open-audits", label: "Open Audits", value: 4 }, { id: "incidents-30d", label: "Incidents (30d)", value: 2 }, { id: "policies", label: "Policies", value: 18 } ],
        insights: { title: "AI Insights", items: [{ id: "co1", icon: "Shield", message: "Audit scope suggests expanding user access reviews.", tags: ["Security","Audit"], severity: "info" }] },
        table: { title: "Compliance Items", columns: ["Item","Area","Status","Owner","Due"], rows: [["Access Review","Security","Open","Alex","2025-09-20"],["Data Retention","Legal","In Progress","Sam","2025-09-18"]] },
        quickLinks: { title: "Quick Links", items: [{ id: "export", label: "Export Report", href: "/app/compliance-tax/gdpr-tools-audit" }] }
      })
      break
    case "core-overview":
      add({
        kpis: [ { id: "tenants", label: "Tenants", value: 3 }, { id: "users", label: "Users", value: 82 }, { id: "roles", label: "Roles", value: 14 } ],
        insights: { title: "AI Insights", items: [{ id: "cr1", icon: "UserCheck", message: "Consider enabling MFA for all admins.", tags: ["Security"], severity: "info" }] },
        table: { title: "Recent Activity", columns: ["Area","Action","By","Time"], rows: [["Users","Invite","alex","09:30"],["Settings","Theme change","mona","09:02"]] },
        quickLinks: { title: "Quick Links", items: [{ id: "tenant-settings", label: "Tenant Settings", href: "/app/core/tenant-settings" }, { id: "user-directory", label: "User Directory", href: "/app/core/users-roles" }] }
      })
      break
    case "enterprise-overview":
      add({
        kpis: [ { id: "entities", label: "Entities", value: 5 }, { id: "elims", label: "Eliminations", value: 12 }, { id: "consols", label: "Consolidations", value: 2 } ],
        insights: { title: "AI Insights", items: [{ id: "ent1", icon: "Building2", message: "Intercompany balances increased 8% this month.", tags: ["Finance"], severity: "info" }] },
        table: { title: "Entities", columns: ["Name","Base CCY","Status"], rows: [["UK","GBP","Open"],["US","USD","Open"],["EU","EUR","Closed"]] },
        quickLinks: { title: "Quick Links", items: [{ id: "open-consol", label: "Open Consolidation", href: "/app/enterprise-analytics/intercompany-consolidation" }] }
      })
      break
    case "finance-overview":
      add({
        kpis: [ { id: "period", label: "Current Period", value: 9 }, { id: "trial-balance", label: "Trial Balance", value: 0, currency: "GBP" }, { id: "open-items", label: "Open Items", value: 112 } ],
        insights: { title: "AI Insights", items: [{ id: "fin1", icon: "FileChart", message: "AP due in 7 days exceeds typical cash inflow.", tags: ["AP","Cash"], severity: "warning" }] },
        table: { title: "Period Close Checklist", columns: ["Task","Owner","Status","Due"], rows: [["Accruals","Alex","Open","2025-09-15"],["Reconciliations","Mona","In Progress","2025-09-16"]] },
        quickLinks: { title: "Quick Links", items: [{ id: "close", label: "Open Close", href: "/app/finance/period-close" }, { id: "reports", label: "Reports", href: "/app/enterprise-analytics/analytics-dashboards" }] }
      })
      break
    case "hr-overview":
      add({
        kpis: [ { id: "headcount", label: "Headcount", value: 82 }, { id: "starters", label: "Starters", value: 3 }, { id: "leavers", label: "Leavers", value: 1 } ],
        insights: { title: "AI Insights", items: [{ id: "hr1", icon: "Users", message: "Onboarding tasks pending for 2 new starters.", tags: ["HR"], severity: "info" }] },
        table: { title: "People", columns: ["Name","Dept","Role","Start","Status"], rows: [["Alex","Finance","Analyst","2025-09-01","Active"],["Mona","Ops","Manager","2024-11-12","Active"]] },
        quickLinks: { title: "Quick Links", items: [{ id: "new-emp", label: "Add Employee", href: "/app/hr-payroll/employees" },{ id: "run-pay", label: "Run Payroll", href: "/app/hr-payroll/payroll" }] }
      })
      break
    case "wms-overview":
      add({ kpis: [ { id: "skus", label: "SKUs", value: 1248 }, { id: "lots", label: "Lots", value: 542 }, { id: "onhand", label: "On-hand (qty)", value: 81240 } ], insights: { title: "AI Insights", items: [{ id: "w1", icon: "Boxes", message: "Bin WH2-23 nearing capacity.", tags: ["WMS"], severity: "info" }] }, table: { title: "Inventory Snapshot", columns: ["SKU","Lot","WH","Qty","Valuation"], rows: [["A-100","L-01","WH1","120","£1.2k"],["B-200","L-05","WH2","80","£0.8k"]] }, quickLinks: { title: "Quick Links", items: [{ id: "count", label: "Cycle Count", href: "/app/inventory-wms/cycle-counting" }] } })
      break
    case "mfg-overview":
      add({ kpis: [ { id: "open-wo", label: "Open WOs", value: 18 }, { id: "on-time", label: "On-time %", value: 92, suffix: "%" }, { id: "oee", label: "OEE", value: 72, suffix: "%" } ], insights: { title: "AI Insights", items: [{ id: "mf1", icon: "Factory", message: "Line 2 OEE trending down 3%.", tags: ["Manufacturing"], severity: "info" }] }, table: { title: "KPIs by line", columns: ["Line","WO","Planned","Actual","OEE"], rows: [["L1","WO-100","450","430","76%"],["L2","WO-101","300","270","68%"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-wo", label: "New Work Order", href: "/app/manufacturing/work-orders" }] } })
      break
    case "mobile-overview":
      add({ kpis: [ { id: "devices", label: "Test Devices", value: 6 }, { id: "tf-builds", label: "TestFlight Builds", value: 2 }, { id: "apks", label: "APKs", value: 3 } ], insights: { title: "AI Insights", items: [{ id: "mo1", icon: "Mobile", message: "Crash rate decreased 12% week-over-week.", tags: ["Mobile"], severity: "info" }] }, list: { title: "Packaging Notes", items: ["EAS","Expo","Fastlane"] }, quickLinks: { title: "Quick Links", items: [{ id: "docs", label: "Open Docs", href: "/app/mobile-pwa/ios-android-app" }] } })
      break
    case "pos-overview":
      add({ kpis: [ { id: "terms", label: "Terminals", value: 3 }, { id: "sales-today", label: "Sales Today", value: 2180, currency: "GBP" }, { id: "basket", label: "Avg Basket", value: 18.4, currency: "GBP" } ], insights: { title: "AI Insights", items: [{ id: "ps1", icon: "ShoppingCart", message: "Afternoon footfall up 9% vs. yesterday.", tags: ["POS"], severity: "info" }] }, table: { title: "Receipts", columns: ["ID","Time","Amount","Method","Status"], rows: [["R-1001","10:12","£12.40","card","ok"],["R-1002","10:15","£9.99","card","ok"]] }, quickLinks: { title: "Quick Links", items: [{ id: "open-term", label: "Open Terminal", href: "/app/pos" }] } })
      break
    case "projects-overview":
      add({ kpis: [ { id: "open", label: "Open Projects", value: 14 }, { id: "tasks", label: "Tasks", value: 182 }, { id: "wip", label: "WIP", value: 22, currency: "GBP" } ], insights: { title: "AI Insights", items: [{ id: "pj1", icon: "ClipboardList", message: "3 tasks overdue in ERP project.", tags: ["Projects"], severity: "warning" }] }, table: { title: "Projects", columns: ["Name","PM","Tasks","Status"], rows: [["ERP","Alex","42","Active"],["WMS","Mona","18","Planning"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-proj", label: "New Project", href: "/app/projects/projects-tasks" }] } })
      break
    case "purch-overview":
      add({ kpis: [ { id: "open-reqs", label: "Open Reqs", value: 12 }, { id: "open-pos", label: "Open POs", value: 28 }, { id: "late-pos", label: "Late POs", value: 3 } ], insights: { title: "AI Insights", items: [{ id: "pu1", icon: "ShoppingBag", message: "Supplier ABC lead time increased by 5 days.", tags: ["Purchasing"], severity: "info" }] }, table: { title: "Requisitions", columns: ["ID","Dept","Amount","Status"], rows: [["REQ-1001","Ops","£420","Open"],["REQ-1002","IT","£910","Approved"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-req", label: "New Requisition", href: "/app/purchasing/requisitions" }] } })
      break
    case "sales-overview":
      add({ kpis: [ { id: "pipeline", label: "Pipeline", value: 580000, currency: "GBP" }, { id: "open-opps", label: "Open Opps", value: 42 }, { id: "win-rate", label: "Win Rate %", value: 28, suffix: "%" } ], insights: { title: "AI Insights", items: [{ id: "sl1", icon: "TrendingUp", message: "Conversion highest in manufacturing segment.", tags: ["Sales"], severity: "info" }] }, table: { title: "Overview", columns: ["Segment","Opps","Pipeline","Win %"], rows: [["Manufacturing","12","£220k","32%"],["Retail","9","£140k","22%"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-lead", label: "New Lead", href: "/app/sales-crm/leads-opportunities" }] } })
      break
    case "settings-overview":
      add({ kpis: [ { id: "connectors", label: "Connectors", value: 6 }, { id: "api-keys", label: "API Keys", value: 8 }, { id: "backups", label: "Backups", value: 14 } ], insights: { title: "AI Insights", items: [{ id: "st1", icon: "Cog", message: "Enable email domain allowlist for improved security.", tags: ["Security"], severity: "info" }] }, list: { title: "Settings", items: ["General","Branding","Billing","Notifications","Security"] }, quickLinks: { title: "Quick Links", items: [{ id: "open-settings", label: "Open Settings", href: "/app/core/tenant-settings" }] } })
      break
    case "dashboard":
      add({
        kpis: [
          { id: "revenue", label: "Revenue", value: 405280, currency: "GBP" },
          { id: "invoices", label: "Invoices", value: 168 },
          { id: "inventory", label: "Inventory", value: 23450 },
        ],
        insights: { title: "AI Insights", items: [{ id: "i1", message: "System healthy", tags: ["Core"], severity: "info" }] },
        quickLinks: { title: "Quick Links", items: [{ id: "help", label: "Help", href: "/app/core/help-docs" }, { id: "reports", label: "Run Report", href: "/app/enterprise-analytics/analytics-dashboards" }] },
        table: { title: "Recent Activity", columns: ["Time","Area","Item","User"], rows: [["09:32","Finance","INV-1024","alex"],["09:28","Sales","SO-8831","sam"],["09:12","Inventory","Item A-100","mona"]] }
      })
      break
    case "ai-hub":
      add({
        kpis: [
          { id: "automation-runs", label: "Automation Runs (30d)", value: 1284 },
          { id: "saved-hours", label: "Saved Hours (est.)", value: 416 },
          { id: "active-workflows", label: "Active Workflows", value: 37 },
        ],
        insights: { title: "AI Insights", items: [{ id: "ai1", message: "Enable OCR for invoice capture", tags: ["OCR","Finance"], severity: "info" }] },
        quickLinks: { title: "Quick Links", items: [
          { id: "assist", label: "Open Nexa AI Assist", href: "/app/ai-automation/nexa-ai-assist" },
          { id: "wf", label: "Create Workflow", href: "/app/ai-automation/workflows-jobs" },
          { id: "ocr", label: "Upload Document", href: "/app/ai-automation/ocr-document-ai" },
          { id: "notif", label: "Notification Rules", href: "/app/ai-automation/notifications" },
        ]},
      })
      break
    case "assist":
      add({
        kpis: [
          { id: "questions-today", label: "Questions Today", value: 86 },
          { id: "avg-response", label: "Avg Response (s)", value: 1.4 },
          { id: "satisfaction", label: "Satisfaction %", value: 92, suffix: "%" },
        ],
        content: { type: "assist", panels: [
          { title: "Ask Nexa", placeholder: "Ask about revenue, invoices, workflows, or stock…" },
          { title: "Suggested Prompts", items: [
            "Summarise this week’s invoices over £5,000",
            "Draft an email to chase overdue invoices",
            "Create a workflow to auto-tag purchase orders > £10k",
          ]},
        ]},
        quickLinks: { title: "Quick Links", items: [{ id: "prompt-lib", label: "Prompt Library", href: "/app/ai-automation/nexa-ai-assist" }, { id: "open-chat", label: "Open Chat", href: "/app/ai-automation/nexa-ai-assist" }] }
      })
      break
    case "uploader":
      add({
        kpis: [
          { id: "docs-processed", label: "Docs Processed (30d)", value: 914 },
          { id: "auto-extract", label: "Auto-Extract Rate", value: 93 },
        ],
        uploader: { accept: [".pdf", ".png", ".jpg"], maxSizeMB: 20, help: "Drop invoices, POs, delivery notes, or statements to auto-extract fields." },
      })
      break
    case "scenario-table":
      add({
        kpis: [ { id: "scenarios", label: "Saved Scenarios", value: 12 }, { id: "horizon", label: "Horizon (months)", value: 6 }, { id: "accuracy", label: "Forecast Accuracy %", value: 87, suffix: "%" } ],
        table: { title: "Scenarios", columns: ["Scenario","Area","Assumption","Impact","Owner"], rows: [
          ["Price +3%","Sales","Increase list price by 3%","GP +£48k","Alex"],
          ["Lead time +5d","Inventory","Supplier delay","Stockout risk ↑","Sam"]
        ], actions: [{ label: "New Scenario", href: "/app/ai-automation/predictive-scenarios" }] },
      })
      break
    case "workflow-table":
      add({
        kpis: [ { id: "active", label: "Active", value: 37 }, { id: "failed-24h", label: "Failed (24h)", value: 1 } ],
        table: { columns: ["Workflow","Trigger","Last Run","Status"], rows: [
          ["Auto-tag POs > £10k", "PO created", "Today 11:02", "OK"],
          ["OCR Invoices", "File uploaded", "Today 10:41", "OK"],
          ["Sync bank feed", "Hourly", "Today 10:00", "OK"],
        ], actions: [{ label: "New Workflow", href: "/app/ai-automation/workflows-jobs" }] },
      })
      break
    case "list-rules":
      add({
        kpis: [ { id: "rules", label: "Active Rules", value: 22 }, { id: "sent-7d", label: "Sent (7d)", value: 418 }, { id: "failures", label: "Failures", value: 2 } ],
        list: { title: "Example Rules", items: [
          "Alert: Invoice overdue > 7 days",
          "Slack: Stock below safety level",
          "Email: Large payment posted (> £20k)",
        ], actions: [{ label: "Create Rule", href: "/app/ai-automation/notifications" }, { label: "Delivery Channels", href: "/app/ai-automation/notifications" }] },
      })
      break
    // Banking & Billing presets (minimal)
    case "bank-feeds":
      add({ kpis: [ { id: "connected", label: "Connected Accounts", value: 3 }, { id: "last-sync", label: "Last Sync (h)", value: 2 } ], table: { columns: ["Account","Bank","Status"], rows: [["Main","HSBC","OK"],["Ops","Barclays","OK"]] } })
      break
    case "plans-meters":
      add({ kpis: [ { id: "plans", label: "Active Plans", value: 4 }, { id: "meters", label: "Active Meters", value: 12 } ], table: { columns: ["Plan","Price","Active"], rows: [["Starter","£0","Yes"],["Pro","£99","Yes"]] } })
      break
    case "payments":
      add({ kpis: [ { id: "pay-7d", label: "Payments (7d)", value: 214 }, { id: "refunds-7d", label: "Refunds (7d)", value: 6 }, { id: "auth-rate", label: "Auth Rate %", value: 96, suffix: "%" } ], table: { title: "Recent Payments", columns: ["ID","Customer","Amount","Status","Method","Created"], rows: [["pi_123","Acme","£120","succeeded","card","10:12"],["pi_456","Globex","£49","succeeded","card","10:14"]] }, quickLinks: { title: "Quick Links", items: [{ id: "create", label: "Create Payment", href: "/app/banking-billing/stripe-payments" },{ id: "reconcile", label: "Reconcile", href: "/app/banking-billing/stripe-payments" }] } })
      break
    // Compliance presets
    case "audit-log":
      add({ kpis: [ { id: "events-24h", label: "Events (24h)", value: 1842 }, { id: "flagged", label: "Flagged", value: 3 }, { id: "users", label: "Users", value: 82 } ], table: { title: "Audit Log", columns: ["Time","Actor","Action","Target","Result"], rows: [["10:01","alex","login","-","ok"],["10:05","sam","export","invoices","ok"]] }, quickLinks: { title: "Quick Links", items: [{ id: "export", label: "Export", href: "/app/compliance-tax/gdpr-tools-audit" }, { id: "filters", label: "Filters", href: "/app/compliance-tax/gdpr-tools-audit" }] } })
      break
    case "cis-reports":
      add({ kpis: [ { id: "subs", label: "Subcontractors", value: 18 }, { id: "returns-due", label: "Returns Due", value: 2 } ], table: { columns: ["Period","Status"], rows: [["2025-08","Due"],["2025-09","Open"]] } })
      break
    // Core presets
    case "rbac":
      add({ kpis: [ { id: "roles", label: "Roles", value: 14 }, { id: "users", label: "Users", value: 82 } ], table: { columns: ["Role","Users","SoD"], rows: [["Admin",5,"OK"],["Finance",18,"Check"]] } })
      break
    case "settings":
      add({ kpis: [ { id: "sections", label: "Sections", value: 5 }, { id: "admins", label: "Admins", value: 4 }, { id: "policies", label: "Policies", value: 12 } ], list: { title: "Settings", items: ["Company","Users","Appearance","Backups"] }, quickLinks: { title: "Quick Links", items: [{ id: "open-settings", label: "Open Settings", href: "/app/core/tenant-settings" }] } })
      break
    case "help":
      add({ kpis: [ { id: "articles", label: "Articles", value: 182 }, { id: "categories", label: "Categories", value: 12 }, { id: "updated", label: "Updated (7d)", value: 18 } ], list: { title: "Docs", items: ["Getting Started","Finance","Inventory","AI & Automation"] }, quickLinks: { title: "Quick Links", items: [{ id: "open-docs", label: "Open Docs", href: "/app/core/help-docs" }, { id: "support", label: "Contact Support", href: "/app/core/help-docs" }] } })
      break
    // Enterprise presets (minimal)
    case "consolidation":
      add({ kpis: [ { id: "entities", label: "Entities in Group", value: 5 }, { id: "elims", label: "Eliminations", value: 12 }, { id: "status", label: "Consolidation Status", value: 2 } ], table: { title: "Elimination Entries", columns: ["Date","Entity","Account","Amount","Posted"], rows: [["2025-09-10","UK","4000","£1,240","Yes"],["2025-09-10","US","4000","£980","Yes"]] } })
      break
    case "multi-entity":
      add({ kpis: [ { id: "currencies", label: "Currencies", value: 4 }, { id: "revals", label: "Revals Due", value: 1 }, { id: "interco", label: "Interco Balances", value: 48000, currency: "GBP" } ], table: { title: "Entities & Currencies", columns: ["Entity","Base"], rows: [["UK","GBP"],["EU","EUR"]] } })
      break
    case "analytics":
      add({ kpis: [ { id: "dash", label: "Saved Dashboards", value: 7 }, { id: "reports", label: "Reports", value: 23 }, { id: "schedules", label: "Schedules", value: 5 } ], insights: { title: "AI Insights", items: [{ id: "a1", icon: "BarChart3", message: "Create KPI drilldowns for revenue.", tags: ["Analytics"], severity: "info" }] }, table: { title: "Dashboards", columns: ["Name","Owner","Last Run","Usage"], rows: [["Finance KPIs","Alex","09:20","High"],["Ops Health","Mona","08:10","Med"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-dash", label: "New Dashboard", href: "/app/enterprise-analytics/analytics-dashboards" }] } })
      break
    case "siem":
      add({ kpis: [ { id: "alerts-24h", label: "Alerts (24h)", value: 12 }, { id: "errors", label: "Errors", value: 2 } ], table: { columns: ["Time","Severity","Message"], rows: [["09:50","high","Auth failures"],["10:12","low","Slow query"]] } })
      break
    // Finance presets (minimal selections)
    case "gl":
      add({ kpis: [ { id: "accounts", label: "Accounts", value: 142 }, { id: "journals-30d", label: "Journals (30d)", value: 128 }, { id: "suspense", label: "Suspense Balance", value: 0, currency: "GBP" } ], table: { title: "Trial Balance", columns: ["Account","Debit","Credit"], rows: [["1000",1200,0],["2000",0,1200]] }, quickLinks: { title: "Quick Links", items: [{ id: "post-journal", label: "Post Journal", href: "/app/finance/general-ledger" }] } })
      break
    case "ap":
      add({ kpis: [ { id: "open-bills", label: "Open Bills", value: 54 }, { id: "due-7d", label: "Due (7d)", value: 9 } ], table: { columns: ["Vendor","Amount","Due"], rows: [["ABC Ltd","£1,240","2025-09-12"],["XYZ PLC","£4,980","2025-09-15"]] } })
      break
    case "ar":
      add({ kpis: [ { id: "open-inv", label: "Open Invoices", value: 71 }, { id: "overdue", label: "Overdue", value: 6 } ], table: { columns: ["Customer","Amount","Due"], rows: [["Acme","£820","2025-09-10"],["Globex","£1,240","2025-09-01"]] } })
      break
    case "bank-cash":
      add({ kpis: [ { id: "accounts", label: "Accounts", value: 5 }, { id: "total-balance", label: "Total Balance", value: 842000, currency: "GBP" }, { id: "last-sync", label: "Last Sync (h)", value: 2 } ], table: { title: "Bank Accounts", columns: ["Account","Bank","Balance","Reconciled?"], rows: [["Main","HSBC","£420k","Yes"],["Ops","Barclays","£212k","Yes"]] }, quickLinks: { title: "Quick Links", items: [{ id: "open-recon", label: "Open Reconciliation", href: "/app/finance/bank-reconciliation" }] } })
      break
    case "recon":
      add({ kpis: [ { id: "pending", label: "Statements Pending", value: 3 }, { id: "matched", label: "Matched %", value: 98, suffix: "%" }, { id: "oldest", label: "Oldest Pending (d)", value: 4 } ], table: { title: "Reconciliations", columns: ["Account","Statement Date","Imported","Matched"], rows: [["Main","2025-09-10","Yes","98%"],["Ops","2025-09-09","Yes","96%"]] }, quickLinks: { title: "Quick Links", items: [{ id: "import", label: "Import Statement", href: "/app/finance/bank-reconciliation" }] } })
      break
    case "vat":
      add({ kpis: [ { id: "period", label: "Period", value: 9 }, { id: "status", label: "Status", value: 1 } ], content: { type: "list", title: "MTD Submissions", items: ["2025-Q3: Open","2025-Q2: Filed"] } })
      break
    case "fa":
      add({ kpis: [ { id: "assets", label: "Assets", value: 132 }, { id: "nbv", label: "NBV", value: 410000, currency: "GBP" }, { id: "depn", label: "Depn This Period", value: 12000, currency: "GBP" } ], table: { title: "Asset Register", columns: ["Asset","Cat","NBV","Depn Method","In Service"], rows: [["Laptop","IT","£0.6k","SL","2023-07-01"],["Server","IT","£18k","SL","2022-05-12"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-asset", label: "Add Asset", href: "/app/finance/fixed-assets" }] } })
      break
    case "close":
      add({ kpis: [ { id: "tasks", label: "Tasks", value: 18 }, { id: "completed", label: "Completed %", value: 67, suffix: "%" }, { id: "overdue", label: "Overdue", value: 2 } ], list: { title: "Close Tasks", items: ["Accruals","Prepayments","Reconciliations"], actions: [{ label: "Checklist", href: "/app/finance/period-close" }] }, quickLinks: { title: "Quick Links", items: [{ id: "open-close", label: "Open Close", href: "/app/finance/period-close" }] } })
      break
    case "fx":
      add({ kpis: [ { id: "positions", label: "Positions", value: 8 }, { id: "next-reval", label: "Next Reval Date", value: 30 }, { id: "unrealised", label: "Unrealised", value: 23000, currency: "GBP" } ], table: { title: "Positions", columns: ["Currency","Exposure","Rate","Unrealised"], rows: [["USD","$120k","1.27","£18k"],["EUR","€85k","0.85","£5k"]] }, quickLinks: { title: "Quick Links", items: [{ id: "run-reval", label: "Run Revaluation", href: "/app/finance/fx-revaluation" }] } })
      break
    case "costing":
      add({ kpis: [ { id: "std-actual", label: "Std vs Actual Var", value: 14000, currency: "GBP" }, { id: "items-analysed", label: "Items Analysed", value: 412 }, { id: "ppv", label: "PPV", value: -2.3, suffix: "%" } ], table: { title: "Variances", columns: ["Item","Var £","Var %","Driver"], rows: [["A-100","-2.10","-1.2%","Material"],["B-200","0.80","0.5%","Labour"]] }, quickLinks: { title: "Quick Links", items: [{ id: "open-std", label: "Standard Costs", href: "/app/finance/costing" }] } })
      break
    // HR, Inventory, Manufacturing, etc. (provide baseline minimal content)
    case "payroll": add({ kpis: [ { id: "runs", label: "Pay Runs", value: 2 }, { id: "net", label: "Net Pay (£k)", value: 48 } ] }); break
    case "employees": add({ kpis: [ { id: "headcount", label: "Headcount", value: 82 }, { id: "requests", label: "Open Requests", value: 4 }, { id: "holidays", label: "Holidays", value: 12 } ], table: { title: "Employees", columns: ["Name","Dept","Manager","Status"], rows: [["Alex","Finance","Mona","Active"],["Sam","Ops","Mona","Active"]] }, quickLinks: { title: "Quick Links", items: [{ id: "add-emp", label: "Add Employee", href: "/app/hr-payroll/employees" }] } }); break
    case "items": add({ kpis: [ { id: "skus", label: "SKUs", value: 1248 }, { id: "new-month", label: "New this month", value: 42 }, { id: "discontinued", label: "Discontinued", value: 6 } ], table: { title: "Item Master", columns: ["SKU","Name","UoM","Cost","Status"], rows: [["A-100","Widget A","ea","£2.10","Active"],["B-200","Widget B","ea","£1.80","Active"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-item", label: "New Item", href: "/app/inventory-wms/items-lots" }] } }); break
    case "wh": add({ kpis: [ { id: "warehouses", label: "Warehouses", value: 4 }, { id: "bins", label: "Bins", value: 812 }, { id: "capacity", label: "Capacity %", value: 76, suffix: "%" } ], table: { title: "Warehouses", columns: ["Code","Name","Bins","Capacity %","Manager"], rows: [["WH1","Main","420","78","Alex"],["WH2","North","220","71","Mona"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-wh", label: "New Warehouse", href: "/app/inventory-wms/warehouses" }, { id: "bin-list", label: "Bin List", href: "/app/inventory-wms/warehouses" }] } }); break
    case "moves": add({ kpis: [ { id: "moves-7d", label: "Moves (7d)", value: 812 }, { id: "transfers", label: "Transfers", value: 128 }, { id: "adjustments", label: "Adjustments", value: 14 } ], table: { title: "Stock Movements", columns: ["Date","SKU","From","To","Qty","Reason"], rows: [["2025-09-12","A-100","WH1","WH2","24","Transfer"],["2025-09-12","B-200","-","WH1","-3","Adjustment"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-move", label: "New Movement", href: "/app/inventory-wms/stock-movements" }] } }); break
    case "advanced-wms": add({ list: { title: "Advanced WMS", items: ["ASN","Wave","3PL"] }, quickLinks: { title: "Quick Links", items: [{ id: "cfg-asn", label: "Configure ASN", href: "/app/inventory-wms/advanced-wms" }, { id: "wave-plans", label: "Wave Plans", href: "/app/inventory-wms/advanced-wms" }] } }); break
    case "cycle": add({ kpis: [ { id: "counts-due", label: "Counts Due", value: 3 }, { id: "accuracy", label: "Accuracy %", value: 98 }, { id: "variance", label: "Variance £", value: 420, currency: "GBP" } ], table: { title: "Cycle Counts", columns: ["Date","Area","Counted","Accuracy %"], rows: [["2025-09-11","Aisle 1","120","98%"],["2025-09-10","Aisle 4","140","97%"]] }, quickLinks: { title: "Quick Links", items: [{ id: "start-count", label: "Start Count", href: "/app/inventory-wms/cycle-counting" }] } }); break
    case "quality": add({ kpis: [ { id: "holds", label: "Holds", value: 2 }, { id: "capa", label: "CAPA Open", value: 1 }, { id: "releases", label: "Releases (7d)", value: 3 } ], table: { title: "Quality Cases", columns: ["ID","Item","Reason","Status","Owner"], rows: [["Q-1001","A-100","Damaged","Open","Alex"],["Q-1002","B-200","Wrong label","Closed","Mona"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-case", label: "New Case", href: "/app/inventory-wms/quality-capa" }] } }); break
    case "bom": add({ kpis: [ { id: "boms", label: "BOMs", value: 142 }, { id: "pending", label: "Pending Changes", value: 6 }, { id: "multi", label: "Multi-level %", value: 38, suffix: "%" } ], table: { title: "BOMs", columns: ["Item","Rev","Components","Status"], rows: [["A-100","R2","4","Approved"],["B-200","R1","3","Draft"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-bom", label: "New BOM", href: "/app/manufacturing/bom-routings" }] } }); break
    case "wo": add({ kpis: [ { id: "open", label: "Open", value: 18 }, { id: "in-progress", label: "In Progress", value: 7 }, { id: "late", label: "Late", value: 2 } ], table: { title: "Work Orders", columns: ["WO","Item","Qty","Start","Due","Status"], rows: [["WO-100","A-100","120","2025-09-10","2025-09-18","In Progress"],["WO-101","B-200","80","2025-09-08","2025-09-16","Open"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-wo", label: "New Work Order", href: "/app/manufacturing/work-orders" }] } }); break
    case "mrp": add({ kpis: [ { id: "planned", label: "Planned Orders", value: 46 }, { id: "exceptions", label: "Exceptions", value: 5 }, { id: "coverage", label: "Coverage Days", value: 24 } ], table: { title: "Planned Supply", columns: ["Item","Qty","Need By","Action"], rows: [["A-100","120","2025-09-20","Expedite"],["C-300","80","2025-09-22","Release"]] }, quickLinks: { title: "Quick Links", items: [{ id: "run-mrp", label: "Run MRP", href: "/app/manufacturing/mrp" }] } }); break
    case "capacity": add({ kpis: [ { id: "util", label: "Utilisation %", value: 78, suffix: "%" }, { id: "bottlenecks", label: "Bottlenecks", value: 2 }, { id: "ot", label: "OT Hours", value: 6 } ], table: { title: "Resources", columns: ["Center","Avail Hrs","Load %","Next Idle"], rows: [["CNC-1","80","72%","14:00"],["WELD-2","64","81%","16:30"]] }, quickLinks: { title: "Quick Links", items: [{ id: "plan", label: "Capacity Plan", href: "/app/manufacturing/capacity-planning" }] } }); break
    case "aps": add({ kpis: [ { id: "late-orders", label: "Late Orders", value: 3 }, { id: "resched", label: "Resched (7d)", value: 5 }, { id: "otp", label: "OT%", value: 92, suffix: "%" } ], table: { title: "Schedule Exceptions", columns: ["Order","Reason","Action"], rows: [["SO-1002","Supplier delay","Reschedule"],["WO-101","Resource down","Reassign"]] } }); break
    case "maintenance": add({ kpis: [ { id: "pm-due", label: "PM Due", value: 4 }, { id: "breakdown-30d", label: "Breakdown (30d)", value: 1 }, { id: "mttr", label: "MTTR (h)", value: 3.2 } ], table: { title: "Work Requests", columns: ["ID","Asset","Priority","Status"], rows: [["WR-100","Forklift-2","High","Open"],["WR-101","CNC-1","Med","In Progress"]] } }); break
    case "plm": add({ kpis: [ { id: "ecos", label: "ECOs Open", value: 3 }, { id: "approvals", label: "Pending Approvals", value: 2 }, { id: "lt", label: "Lead Time (d)", value: 12 } ], table: { title: "ECOs", columns: ["ECO","Item","Change","Owner","Status"], rows: [["ECO-100","A-100","Rev R2","Alex","Open"],["ECO-101","B-200","Spec update","Mona","Pending"]] } }); break
    case "pwa": add({ kpis: [ { id: "installs", label: "Installs", value: 124 } ], content: { type: "list", title: "Install", items: ["Add to Home Screen","Enable Notifications"] } }); break
    case "mobile": add({ kpis: [ { id: "devices", label: "Test Devices", value: 6 } ], content: { type: "list", title: "Packaging", items: ["EAS","Expo","Fastlane"] } }); break
    case "pos": add({ kpis: [ { id: "terms", label: "Terminals", value: 3 }, { id: "sales-today", label: "Sales Today", value: 2180 } ], table: { columns: ["Receipt","Amount"], rows: [["R-1001","£12.40"],["R-1002","£9.99"]] } }); break
    case "projects": add({ kpis: [ { id: "open", label: "Open Tasks", value: 182 }, { id: "overdue", label: "Overdue", value: 12 }, { id: "completed", label: "Completed %", value: 68, suffix: "%" } ], table: { title: "Tasks", columns: ["Task","Project","Assignee","Due","Status"], rows: [["Implement AP flow","ERP","Alex","2025-09-18","In Progress"],["Docs cleanup","WMS","Mona","2025-09-14","Open"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-task", label: "New Task", href: "/app/projects/projects-tasks" }] } }); break
    case "proj-billing": add({ kpis: [ { id: "billable", label: "Billable Hours", value: 162 }, { id: "wip", label: "WIP", value: 22000, currency: "GBP" }, { id: "draft", label: "Draft Invoices", value: 4 } ], table: { title: "To Bill", columns: ["Project","Hours","Amount","Status"], rows: [["ERP","12","£1,240","Pending"],["WMS","9","£980","Pending"]] }, quickLinks: { title: "Quick Links", items: [{ id: "create-inv", label: "Create Invoice", href: "/app/projects/costing-billing" }] } }); break
    case "req": add({ kpis: [ { id: "open-reqs", label: "Open Reqs", value: 12 }, { id: "approvals", label: "Approvals", value: 3 }, { id: "cycle", label: "Avg Cycle (d)", value: 5 } ], table: { title: "Requisitions", columns: ["ID","Requester","Amount","Status"], rows: [["REQ-1001","Alex","£420","Open"],["REQ-1002","Sam","£910","Approved"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-req", label: "New Requisition", href: "/app/purchasing/requisitions" }] } }); break
    case "po": add({ kpis: [ { id: "open-pos", label: "Open POs", value: 28 }, { id: "backorders", label: "Backorders", value: 6 }, { id: "spend-30d", label: "Spend (30d)", value: 48200, currency: "GBP" } ], table: { title: "Purchase Orders", columns: ["PO No","Supplier","Amount","Expected","Status"], rows: [["PO-1001","ABC","£2,410","2025-09-16","Open"],["PO-1002","XYZ","£780","2025-09-12","Open"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-po", label: "New PO", href: "/app/purchasing/purchase-orders" }] } }); break
    case "sip": add({ kpis: [ { id: "sup-invoices", label: "Supplier Invoices", value: 44 }, { id: "to-pay", label: "To Pay", value: 12 }, { id: "avg-days", label: "Avg Days", value: 28 } ], table: { title: "Supplier Invoices", columns: ["Vendor","Doc","Due","Amount","Status"], rows: [["ABC Ltd","BILL-1001","2025-09-12","£420","Open"],["XYZ PLC","BILL-2001","2025-09-13","£980","Open"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-bill", label: "New Bill", href: "/app/purchasing/supplier-invoices-payments" }] } }); break
    case "leads": add({ kpis: [ { id: "pipeline", label: "Pipeline", value: 580000, currency: "GBP" }, { id: "open-opps", label: "Open Opps", value: 42 }, { id: "new-leads", label: "New Leads", value: 18 } ], table: { title: "Pipeline", columns: ["Lead","Company","Stage","Value","Owner","Close","Prob %","Source","Next Step"], rows: [["Acme","Acme Ltd","Proposal","£80k","Alex","2025-10-01","60","Referral","Call"],["Globex","Globex PLC","Discovery","£35k","Mona","2025-10-10","30","Web","Demo"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-lead", label: "New Lead", href: "/app/sales-crm/leads-opportunities" }, { id: "new-opp", label: "New Opp", href: "/app/sales-crm/leads-opportunities" }] } }); break
    case "so": add({ kpis: [ { id: "open-so", label: "Open SOs", value: 42 }, { id: "backorders", label: "Backorders", value: 6 }, { id: "conv", label: "Conversion %", value: 24, suffix: "%" } ], table: { title: "Sales Orders", columns: ["SO","Customer","Amount","Status","Expected"], rows: [["SO-1001","Acme","£2,410","Picking","2025-09-18"],["SO-1002","Globex","£980","Confirmed","2025-09-15"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-so", label: "New Sales Order", href: "/app/sales-crm/quotations-sales-orders" }] } }); break
    case "rma": add({ kpis: [ { id: "open-rma", label: "Open RMAs", value: 4 }, { id: "avg-res", label: "Avg Resolution (d)", value: 6 }, { id: "credit", label: "Credit £", value: 1200, currency: "GBP" } ], table: { title: "Returns", columns: ["RMA","Customer","Reason","Status"], rows: [["RMA-1001","Acme","Damaged","Received"],["RMA-1002","Globex","Wrong item","Approved"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-rma", label: "New RMA", href: "/app/sales-crm/returns-rma" }] } }); break
    case "connectors": add({ kpis: [ { id: "active", label: "Active Connectors", value: 6 }, { id: "errors-7d", label: "Errors (7d)", value: 1 }, { id: "syncs", label: "Syncs", value: 38 } ], table: { title: "Connectors", columns: ["Name","Type","Status","Last Sync"], rows: [["Stripe","Payments","OK","10:00"],["Xero","Accounting","OK","09:45"]] }, quickLinks: { title: "Quick Links", items: [{ id: "add-conn", label: "Add Connector", href: "/app/settings-connectors/connectors" }] } }); break
    case "apikeys": add({ kpis: [ { id: "keys", label: "Active Keys", value: 8 }, { id: "limits", label: "Rate Limits", value: 1200 }, { id: "calls", label: "Calls (24h)", value: 1842 } ], table: { title: "Keys", columns: ["Key","Scope","Created","Limit"], rows: [["sk_live_***","read","2024-01-01","1200"],["sk_live_***","write","2024-05-12","600"]] }, quickLinks: { title: "Quick Links", items: [{ id: "new-key", label: "New Key", href: "/app/settings-connectors/api-keys-rate-limits" }] } }); break
    case "backups": add({ kpis: [ { id: "snapshots", label: "Snapshots", value: 14 }, { id: "last", label: "Last Backup (h)", value: 20 }, { id: "retention", label: "Retention (days)", value: 30 } ], table: { title: "Backups", columns: ["ID","Time","Size","Restore?"], rows: [["bk-202509110300","2025-09-11 03:00","1.2GB","Yes"],["bk-202509100300","2025-09-10 03:00","1.1GB","Yes"]] }, quickLinks: { title: "Quick Links", items: [{ id: "run-backup", label: "Run Backup", href: "/app/settings-connectors/backups-dr" }] } }); break
    default:
      // Minimal fallback
      add({ kpis: [ { id: "records", label: "Records", value: 0 } ] })
  }
  // content to table/list normalization for audit
  if (base.content && base.content.type === "table" && !base.table) {
    base.table = { title: base.content.title, columns: base.content.columns, rows: base.content.rows, actions: base.content.actions }
  }
  if (base.content && base.content.type === "list" && !base.list) {
    base.list = { title: base.content.title, items: base.content.items, actions: base.content.actions }
  }
  if (base.content && base.content.type === "assist" && !base.list) {
    const prompts = Array.isArray(base.content.panels) ? (base.content.panels.find((p: any)=>Array.isArray(p.items))?.items || []) : []
    base.list = { title: "Suggested Prompts", items: prompts.length ? prompts : ["Show AP due this week","Summarise pipeline by stage"] }
  }
  // ensure ≥3 KPIs
  while (Array.isArray(base.kpis) && base.kpis.length < 3) {
    base.kpis.push({ id: `kpi-${base.kpis.length+1}`, label: `Metric ${base.kpis.length+1}`, value: base.kpis.length*10+1 })
  }
  // ensure Quick Links
  if (!base.quickLinks || !Array.isArray(base.quickLinks.items) || base.quickLinks.items.length === 0) {
    const appPath = `/app/${moduleSlug}`
    base.quickLinks = { title: "Quick Links", items: [ { id: "open", label: `Open ${title}`, href: appPath } ] }
  }
  // ensure Insights
  if (!base.insights || !Array.isArray(base.insights.items) || base.insights.items.length === 0) {
    base.insights = { title: "AI Insights", items: [ { id: "insight-1", icon: "Lightbulb", message: `Consider reviewing ${title.toLowerCase()} KPIs this week.`, tags: [title.split(' ')[0]], severity: "info" } ] }
  }
  // ensure Data block (table/list/uploader)
  if (!base.table && !base.list && !base.uploader) {
    base.table = { title: `${title} Data`, columns: ["Name","Status","Updated"], rows: [["Sample A","OK","Today"],["Sample B","OK","Today"]] }
  }
  return base
}

function writeJson(moduleSlug: string, subSlug: string | null, title: string, preset: string) {
  const crumbs = subSlug ? [titleFromSlug(moduleSlug), title] : [title]
  const json = makeJson(subSlug ? `${moduleSlug}/${subSlug}` : moduleSlug, title, preset, crumbs)
  const file = subSlug ? `${moduleSlug}.${subSlug}.json` : `${moduleSlug}.json`
  ensureDir(PUBLIC_DIR)
  writeFileSync(join(PUBLIC_DIR, file), JSON.stringify(json, null, 2))
}

function pageContent(publicJsonPath: string, depth: number) {
  const rel = depth === 1 ? "../../../components/NexaLayout" : "../../../../components/NexaLayout"
  return `"use client";\nimport { useEffect, useState } from "react";\nimport NexaLayout from "${rel}";\n\nexport default function Page(){\n  const [data,setData]=useState<any>(null);\n  useEffect(()=>{fetch("${publicJsonPath}").then(r=>r.json()).then(setData)},[]);\n  if(!data) return <div>Loading...</div>;\n  return <NexaLayout data={data}/>;\n}\n`
}

function writePage(moduleSlug: string, subSlug: string | null) {
  const dir = subSlug ? join(APP_DIR, moduleSlug, subSlug) : join(APP_DIR, moduleSlug)
  ensureDir(dir)
  const publicPath = subSlug ? `/modules/${moduleSlug}.${subSlug}.json` : `/modules/${moduleSlug}.json`
  const content = pageContent(publicPath, subSlug ? 2 : 1)
  writeFileSync(join(dir, "page.tsx"), content)
}

function writeSidebar() {
  const items: any[] = []
  for (const key of ORDER) {
    const m = spec[key as keyof typeof spec]
    const subs = Array.isArray(m.subs) ? [] : Object.entries(m.subs).map(([slug, s]) => ({ slug, label: s.title }))
    items.push({ slug: key, label: m.title, subs })
  }
  const out = `export type Sub={slug:string;label:string}\nexport type Mod={slug:string;label:string;subs:Sub[]}\nexport const modules:Mod[]=${JSON.stringify(items, null, 2)};\n`
  ensureDir(dirname(SIDEBAR_FILE))
  writeFileSync(SIDEBAR_FILE, out)
}

function main() {
  ensureDir(PUBLIC_DIR)
  ensureDir(APP_DIR)
  for (const [moduleSlug, m] of Object.entries(spec)) {
    writeJson(moduleSlug, null, m.title, m.preset)
    writePage(moduleSlug, null)
    if (!Array.isArray(m.subs)) {
      for (const [subSlug, s] of Object.entries(m.subs)) {
        writeJson(moduleSlug, subSlug, s.title, s.preset)
        writePage(moduleSlug, subSlug)
      }
    }
  }
  writeSidebar()
  console.log("Modules build complete.")
}

main()
