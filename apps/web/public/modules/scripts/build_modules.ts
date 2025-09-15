// Re-add generator (path had issues). See conversation for full spec.
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

type SubSpec = { title: string; preset: string };
type ModSpec = { title: string; preset: string; subs: Record<string, SubSpec> | [] };
type Spec = Record<string, ModSpec>;

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "apps/web/public/modules");
const APP_DIR = join(ROOT, "apps/web/src/app/app");
const SIDEBAR_FILE = join(ROOT, "apps/web/src/lib/router/modules.ts");

const spec: Spec = {
  dashboard: { title: "Dashboard", subs: [], preset: "dashboard" },
  "ai-automation": {
    title: "AI & Automation",
    subs: {
      "nexa-ai-assist": { title: "Nexa AI Assist", preset: "assist" },
      "ocr-document-ai": { title: "OCR & Document AI", preset: "uploader" },
      "predictive-scenarios": { title: "Predictive Scenarios", preset: "scenario-table" },
      "workflows-jobs": { title: "Workflows & Jobs", preset: "workflow-table" },
      notifications: { title: "Notifications", preset: "list-rules" },
    },
    preset: "ai-hub",
  },
} as const;

const ORDER = ["dashboard", "ai-automation"] as const;

function ensureDir(p: string) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }

function makeJson(moduleSlug: string, title: string, preset: string, crumbs: string[]) {
  const base: any = {
    module: moduleSlug,
    title,
    breadcrumbs: crumbs,
    layout: { grid: [
      { area: "kpis", row: 1, col: 1, colSpan: 12 },
      { area: "insights", row: 2, col: 1, colSpan: 8 },
      { area: "quickLinks", row: 2, col: 9, colSpan: 4 },
      { area: "aiEngine", row: 3, col: 1, colSpan: 12 },
    ]},
    aiEngine: { title: "AI Engine", placeholder: `Ask about ${title}…`, endpoint: "/api/ai/engine" },
    kpis: [], insights: { title: "AI Insights", items: [] }, quickLinks: { title: "Quick Links", items: [] },
  };
  if (preset === "dashboard") {
    base.kpis = [ { id: "revenue", label: "Revenue", value: 405280 }, { id: "invoices", label: "Invoices", value: 168 }, { id: "inventory", label: "Inventory", value: 23450 } ];
    base.insights.items = [{ id: "i1", message: "System healthy", tags: ["Core"] }];
  }
  if (preset === "ai-hub") {
    base.kpis = [ { id: "automation-runs", label: "Automation Runs (30d)", value: 1284 }, { id: "saved-hours", label: "Saved Hours (est.)", value: 416 }, { id: "active-workflows", label: "Active Workflows", value: 37 } ];
    base.insights.items = [{ id: "ai1", message: "Enable OCR for invoice capture", tags: ["OCR","Finance"] }];
    base.quickLinks.items = [ { id: "assist", label: "Open Nexa AI Assist", href: "/app/ai-automation/nexa-ai-assist" } ];
  }
  if (preset === "assist") {
    base.kpis = [ { id: "questions-today", label: "Questions Today", value: 86 }, { id: "avg-response", label: "Avg Response (s)", value: 1.4 } ];
    base.content = { type: "assist", panels: [{ title: "Ask Nexa", placeholder: "Ask about revenue, invoices, workflows, or stock…" }] };
  }
  if (preset === "uploader") {
    base.kpis = [ { id: "docs-processed", label: "Docs Processed (30d)", value: 914 }, { id: "auto-extract", label: "Auto-Extract Rate", value: 93 } ];
    base.uploader = { accept: [".pdf", ".png", ".jpg"], maxSizeMB: 20, help: "Drop invoices, POs, delivery notes, or statements." };
  }
  if (preset === "scenario-table") {
    base.kpis = [ { id: "scenarios", label: "Saved Scenarios", value: 12 }, { id: "forecast-horizon", label: "Forecast Horizon (months)", value: 6 } ];
    base.content = { type: "table", columns: ["Scenario","Area","Assumption","Impact"], rows: [["Price +3%","Sales","Increase list price by 3%","GP +£48k"],["Lead time +5d","Inventory","Supplier delay","Stockout risk ↑"]] };
  }
  if (preset === "workflow-table") {
    base.kpis = [ { id: "active", label: "Active", value: 37 }, { id: "failed-24h", label: "Failed (24h)", value: 1 } ];
    base.table = { columns: ["Workflow","Trigger","Last Run","Status"], rows: [["Auto-tag POs > £10k","PO created","Today 11:02","OK"],["OCR Invoices","File uploaded","Today 10:41","OK"],["Sync bank feed","Hourly","Today 10:00","OK"]] };
  }
  if (preset === "list-rules") {
    base.kpis = [ { id: "rules", label: "Active Rules", value: 22 }, { id: "sent-7d", label: "Sent (7d)", value: 418 } ];
    base.content = { type: "list", title: "Example Rules", items: ["Alert: Invoice overdue > 7 days","Slack: Stock below safety level","Email: Large payment posted (> £20k)"] };
  }
  return base;
}

function titleFromSlug(slug: string) { return slug.replace(/-/g, " ").replace(/\b\w/g, c=>c.toUpperCase()); }

function writeJson(moduleSlug: string, subSlug: string | null, title: string, preset: string){
  const crumbs = subSlug ? [titleFromSlug(moduleSlug), title] : [title];
  const json = makeJson(subSlug ? `${moduleSlug}/${subSlug}` : moduleSlug, title, preset, crumbs);
  const file = subSlug ? `${moduleSlug}.${subSlug}.json` : `${moduleSlug}.json`;
  ensureDir(PUBLIC_DIR);
  writeFileSync(join(PUBLIC_DIR, file), JSON.stringify(json, null, 2));
}

function pageContent(publicJsonPath: string, depth: number){
  const rel = depth===1 ? "../../../components/NexaLayout" : "../../../../components/NexaLayout";
  return `"use client";\nimport { useEffect, useState } from "react";\nimport NexaLayout from "${rel}";\n\nexport default function Page(){\n  const [data,setData]=useState<any>(null);\n  useEffect(()=>{fetch("${publicJsonPath}").then(r=>r.json()).then(setData)},[]);\n  if(!data) return <div>Loading...</div>;\n  return <NexaLayout data={data}/>;\n}\n`;
}

function writePage(moduleSlug: string, subSlug: string | null){
  const dir = subSlug ? join(APP_DIR, moduleSlug, subSlug) : join(APP_DIR, moduleSlug);
  ensureDir(dir);
  const publicPath = subSlug ? `/modules/${moduleSlug}.${subSlug}.json` : `/modules/${moduleSlug}.json`;
  const content = pageContent(publicPath, subSlug ? 2 : 1);
  writeFileSync(join(dir, "page.tsx"), content);
}

function writeSidebar(){
  const items: any[] = [];
  for(const key of ORDER){
    const m = spec[key as keyof typeof spec];
    const subs = Array.isArray(m.subs) ? [] : Object.entries(m.subs).map(([slug, s])=>({ slug, label: s.title }));
    items.push({ slug: key, label: m.title, subs });
  }
  const out = `export type Sub={slug:string;label:string}\nexport type Mod={slug:string;label:string;subs:Sub[]}\nexport const modules:Mod[]=${JSON.stringify(items, null, 2)};\n`;
  ensureDir(dirname(SIDEBAR_FILE));
  writeFileSync(SIDEBAR_FILE, out);
}

function main(){
  ensureDir(PUBLIC_DIR); ensureDir(APP_DIR);
  for(const [moduleSlug, m] of Object.entries(spec)){
    writeJson(moduleSlug, null, m.title, m.preset);
    writePage(moduleSlug, null);
    if(!Array.isArray(m.subs)){
      for(const [subSlug, s] of Object.entries(m.subs)){
        writeJson(moduleSlug, subSlug, s.title, s.preset);
        writePage(moduleSlug, subSlug);
      }
    }
  }
  writeSidebar();
  console.log("Modules build complete.");
}

main();

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";

type Spec = Record<string, { title: string; preset: string; subs: Record<string, { title: string; preset: string }> | []; }>

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "apps/web/public/modules");
const APP_DIR = join(ROOT, "apps/web/src/app/app");
const SIDEBAR_FILE = join(ROOT, "apps/web/src/lib/router/modules.ts");

const spec: Spec = {
  "dashboard": { title: "Dashboard", subs: [], preset: "dashboard" },
  "ai-automation": {
    title: "AI & Automation",
    subs: {
      "nexa-ai-assist": { title: "Nexa AI Assist", preset: "assist" },
      "ocr-document-ai": { title: "OCR & Document AI", preset: "uploader" },
      "predictive-scenarios": { title: "Predictive Scenarios", preset: "scenario-table" },
      "workflows-jobs": { title: "Workflows & Jobs", preset: "workflow-table" },
      "notifications": { title: "Notifications", preset: "list-rules" }
    },
    preset: "ai-hub"
  },
  "banking-billing": {
    title: "Banking & Billing",
    subs: {
      "open-banking": { title: "Open Banking", preset: "bank-feeds" },
      "billing-metering": { title: "Billing & Metering", preset: "plans-meters" },
      "stripe-payments": { title: "Stripe Payments", preset: "payments" }
    },
    preset: "banking-overview"
  },
  "compliance-tax": {
    title: "Compliance & Tax",
    subs: {
      "gdpr-tools-audit": { title: "GDPR Tools & Audit", preset: "audit-log" },
      "cis": { title: "CIS (Construction Industry Scheme)", preset: "cis-reports" }
    },
    preset: "compliance-overview"
  },
  "core": {
    title: "Core",
    subs: {
      "dashboard": { title: "Dashboard", preset: "dashboard" },
      "users-roles": { title: "Users & Roles (RBAC / SoD)", preset: "rbac" },
      "tenant-settings": { title: "Tenant & Settings", preset: "settings" },
      "help-docs": { title: "Help & Docs", preset: "help" }
    },
    preset: "core-overview"
  },
  "enterprise-analytics": {
    title: "Enterprise & Analytics",
    subs: {
      "intercompany-consolidation": { title: "Intercompany & Consolidation", preset: "consolidation" },
      "multi-currency-entity": { title: "Multi-Currency & Multi-Entity", preset: "multi-entity" },
      "analytics-dashboards": { title: "Analytics & Dashboards", preset: "analytics" },
      "observability-siem": { title: "Observability & SIEM", preset: "siem" }
    },
    preset: "enterprise-overview"
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
      "costing": { title: "Costing", preset: "costing" }
    },
    preset: "finance-overview"
  },
  "hr-payroll": {
    title: "HR & Payroll",
    subs: {
      "payroll": { title: "Payroll", preset: "payroll" },
      "employees": { title: "Employees", preset: "employees" }
    },
    preset: "hr-overview"
  },
  "inventory-wms": {
    title: "Inventory & WMS",
    subs: {
      "items-lots": { title: "Items & Lots", preset: "items" },
      "warehouses": { title: "Warehouses", preset: "wh" },
      "stock-movements": { title: "Stock Movements", preset: "moves" },
      "advanced-wms": { title: "Advanced WMS (ASN, Wave, 3PL)", preset: "advanced-wms" },
      "cycle-counting": { title: "Cycle Counting", preset: "cycle" },
      "quality-capa": { title: "Quality (Holds & CAPA)", preset: "quality" }
    },
    preset: "wms-overview"
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
      "plm": { title: "PLM", preset: "plm" }
    },
    preset: "mfg-overview"
  },
  "mobile-pwa": {
    title: "Mobile & PWA",
    subs: {
      "installable-pwa": { title: "Installable PWA", preset: "pwa" },
      "ios-android-app": { title: "iOS & Android App", preset: "mobile" }
    },
    preset: "mobile-overview"
  },
  "pos": {
    title: "POS",
    subs: {
      "pos": { title: "Point of Sale (POS)", preset: "pos" }
    },
    preset: "pos-overview"
  },
  "projects": {
    title: "Projects",
    subs: {
      "projects-tasks": { title: "Projects & Tasks", preset: "projects" },
      "costing-billing": { title: "Costing & Billing", preset: "proj-billing" }
    },
    preset: "projects-overview"
  },
  "purchasing": {
    title: "Purchasing",
    subs: {
      "requisitions": { title: "Requisitions", preset: "req" },
      "purchase-orders": { title: "Purchase Orders", preset: "po" },
      "supplier-invoices-payments": { title: "Supplier Invoices & Payments", preset: "sip" }
    },
    preset: "purch-overview"
  },
  "sales-crm": {
    title: "Sales & CRM",
    subs: {
      "leads-opportunities": { title: "Leads & Opportunities", preset: "leads" },
      "quotations-sales-orders": { title: "Quotations & Sales Orders", preset: "so" },
      "returns-rma": { title: "Returns (RMA)", preset: "rma" }
    },
    preset: "sales-overview"
  },
  "settings-connectors": {
    title: "Settings & Connectors",
    subs: {
      "connectors": { title: "Connectors", preset: "connectors" },
      "api-keys-rate-limits": { title: "API Keys & Rate Limits", preset: "apikeys" },
      "backups-dr": { title: "Backups & DR", preset: "backups" }
    },
    preset: "settings-overview"
  }
} as const;

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
] as const;

function ensureDir(p: string){ if(!existsSync(p)) mkdirSync(p, { recursive: true }); }

function makeJson(moduleSlug: string, title: string, preset: string, crumbs: string[]){
  const base: any = {
    module: moduleSlug,
    title,
    breadcrumbs: crumbs,
    layout: { grid: [
      { area: "kpis", row: 1, col: 1, colSpan: 12 },
      { area: "insights", row: 2, col: 1, colSpan: 8 },
      { area: "quickLinks", row: 2, col: 9, colSpan: 4 },
      { area: "aiEngine", row: 3, col: 1, colSpan: 12 }
    ]},
    aiEngine: { title: "AI Engine", placeholder: `Ask about ${title}…`, endpoint: "/api/ai/engine" },
    kpis: [],
    insights: { title: "AI Insights", items: [] },
    quickLinks: { title: "Quick Links", items: [] },
  };
  // minimal preset population
  switch(preset){
    case "dashboard":
      base.kpis = [
        { id: "revenue", label: "Revenue", value: 405280 },
        { id: "invoices", label: "Invoices", value: 168 },
        { id: "inventory", label: "Inventory", value: 23450 },
      ];
      base.insights.items = [{ id: "note", message: "System is healthy.", tags: ["Core"], severity: "info" }];
      base.quickLinks.items = [{ id: "help", label: "Help", href: "/app/core/help-docs" }];
      break;
    case "ai-hub":
      base.kpis = [
        { id: "automation-runs", label: "Automation Runs (30d)", value: 1284 },
        { id: "saved-hours", label: "Saved Hours (est.)", value: 416 },
        { id: "active-workflows", label: "Active Workflows", value: 37 },
      ];
      base.insights.items = [{ id: "invoice-automation", message: "Enable OCR to automate invoice capture.", tags: ["Finance","OCR","Workflows"], severity: "info" }];
      base.quickLinks.items = [
        { id: "assist", label: "Open Nexa AI Assist", href: "/app/ai-automation/nexa-ai-assist" },
        { id: "wf", label: "Create Workflow", href: "/app/ai-automation/workflows-jobs" },
        { id: "ocr", label: "Upload Document", href: "/app/ai-automation/ocr-document-ai" },
        { id: "notif", label: "Notification Rules", href: "/app/ai-automation/notifications" },
      ];
      break;
    case "assist":
      base.kpis = [
        { id: "questions-today", label: "Questions Today", value: 86 },
        { id: "avg-response", label: "Avg Response (s)", value: 1.4 },
      ];
      base.content = { type: "assist", panels: [
        { title: "Ask Nexa", placeholder: "Ask about revenue, invoices, workflows, or stock…" },
        { title: "Suggested Prompts", items: ["Summarise this week’s invoices over £5,000","Draft an email to chase overdue invoices","Create a workflow to auto-tag purchase orders > £10k"] },
      ]};
      break;
    case "uploader":
      base.kpis = [
        { id: "docs-processed", label: "Docs Processed (30d)", value: 914 },
        { id: "auto-extract", label: "Auto-Extract Rate", value: 93 },
      ];
      base.uploader = { accept: [".pdf",".png",".jpg"], maxSizeMB: 20, help: "Drop invoices, POs, delivery notes, or statements." };
      break;
    case "scenario-table":
      base.kpis = [ { id: "scenarios", label: "Saved Scenarios", value: 12 }, { id: "forecast-horizon", label: "Forecast Horizon (months)", value: 6 } ];
      base.content = { type: "table", columns: ["Scenario","Area","Assumption","Impact"], rows: [["Price +3%","Sales","Increase list price by 3%","GP +£48k"],["Lead time +5d","Inventory","Supplier delay","Stockout risk ↑"]], actions: [{ label: "New Scenario", href: "/app/ai-automation/predictive-scenarios" }] };
      break;
    case "workflow-table":
      base.kpis = [ { id: "active", label: "Active", value: 37 }, { id: "failed-24h", label: "Failed (24h)", value: 1 } ];
      base.table = { columns: ["Workflow","Trigger","Last Run","Status"], rows: [["Auto-tag POs > £10k","PO created","Today 11:02","OK"],["OCR Invoices","File uploaded","Today 10:41","OK"],["Sync bank feed","Hourly","Today 10:00","OK"]], actions: [{ label: "New Workflow", href: "/app/ai-automation/workflows-jobs" }] };
      break;
    case "list-rules":
      base.kpis = [ { id: "rules", label: "Active Rules", value: 22 }, { id: "sent-7d", label: "Sent (7d)", value: 418 } ];
      base.content = { type: "list", title: "Example Rules", items: ["Alert: Invoice overdue > 7 days","Slack: Stock below safety level","Email: Large payment posted (> £20k)"], actions: [{ label: "Create Rule", href: "/app/ai-automation/notifications" }] };
      break;
    default:
      // keep minimal placeholders
      base.kpis = [{ id: "k1", label: "Records", value: 0 }];
      base.insights.items = [{ id: "insight", message: `${title} ready.`, tags: [], severity: "info" }];
  }
  return base;
}

function writeJson(moduleSlug: string, subSlug: string | null, title: string, preset: string){
  const crumbs = subSlug ? [titleFromSlug(moduleSlug), title] : [title];
  const json = makeJson(subSlug ? `${moduleSlug}/${subSlug}` : moduleSlug, title, preset, crumbs);
  const file = subSlug ? `${moduleSlug}.${subSlug}.json` : `${moduleSlug}.json`;
  ensureDir(PUBLIC_DIR);
  writeFileSync(join(PUBLIC_DIR, file), JSON.stringify(json, null, 2));
}

function titleFromSlug(slug: string){
  return spec[slug as keyof typeof spec]?.title || slug.replace(/-/g, " ").replace(/\b\w/g, c=>c.toUpperCase());
}

function pageContent(publicJsonPath: string, depth: number){
  const rel = depth===1 ? "../../../components/NexaLayout" : "../../../../components/NexaLayout";
  return `"use client";\nimport { useEffect, useState } from "react";\nimport NexaLayout from "${rel}";\n\nexport default function Page(){\n  const [data,setData]=useState<any>(null);\n  useEffect(()=>{fetch("${publicJsonPath}").then(r=>r.json()).then(setData)},[]);\n  if(!data) return <div>Loading...</div>;\n  return <NexaLayout data={data}/>;\n}\n`;
}

function writePage(moduleSlug: string, subSlug: string | null){
  const dir = subSlug ? join(APP_DIR, moduleSlug, subSlug) : join(APP_DIR, moduleSlug);
  ensureDir(dir);
  const publicPath = subSlug ? `/modules/${moduleSlug}.${subSlug}.json` : `/modules/${moduleSlug}.json`;
  const content = pageContent(publicPath, subSlug ? 2 : 1);
  writeFileSync(join(dir, "page.tsx"), content);
}

function writeSidebar(){
  const items: any[] = [];
  for(const key of ORDER){
    const m = spec[key as keyof typeof spec];
    const subs = Array.isArray(m.subs) ? [] : Object.entries(m.subs).map(([slug, s])=>({ slug, label: s.title }));
    items.push({ slug: key, label: m.title, subs });
  }
  const out = `export type Sub={slug:string;label:string}\nexport type Mod={slug:string;label:string;subs:Sub[]}\nexport const modules:Mod[]=${JSON.stringify(items, null, 2)};\n`;
  ensureDir(dirname(SIDEBAR_FILE));
  writeFileSync(SIDEBAR_FILE, out);
}

function main(){
  ensureDir(PUBLIC_DIR); ensureDir(APP_DIR);
  for(const [moduleSlug, m] of Object.entries(spec)){
    writeJson(moduleSlug, null, m.title, m.preset);
    writePage(moduleSlug, null);
    if(!Array.isArray(m.subs)){
      for(const [subSlug, s] of Object.entries(m.subs)){
        writeJson(moduleSlug, subSlug, s.title, s.preset);
        writePage(moduleSlug, subSlug);
      }
    }
  }
  writeSidebar();
  console.log("Modules build complete.");
}

main();


