#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${ROOT:-$HOME/Desktop/Business Opportunities/Nexa ERP}"
BACKEND="$ROOT/Nexa ERP Backend"
REPORTS="$BACKEND/reports"
TS="$(date +%Y%m%d%H%M%S)"
OUT_MD="$REPORTS/feature-verification-${TS}.md"
mkdir -p "$REPORTS"

# Collect latest logs for evidence scanning (limit to 30) - compatible with macOS bash 3.x
latest_logs="$(ls -1t "$REPORTS"/phase-*.log 2>/dev/null | head -n 30 || true)"

# Features CSV: Category, Feature, requires_keys (true/false), log_grep (| separated), code_grep (| separated)
read -r -d '' FEATURES_CSV << 'CSV'
Core,Dashboard,false,"/api/status|health","apps/web/src/app/(app)/dashboard|apps/web/src/app/(app)/home"
Core,Users & Roles (RBAC/SoD),false,"SoD|RBAC|sod matrix","apps/web/src/lib/auth|sod|rbac"
Core,Tenants & Settings,false,"multi-entity|tenant","apps/web/src/app/api/tenants|/settings"
Core,Help & Docs,false,"help docs","apps/web/src/app/(public)/docs"
Core,AI Audit Logs,false,"AI Logs|assistant_audit","apps/web/src/lib/ai/audit|/api/*/status"

Finance,General Ledger,false,"trial balance|journal post","apps/web/src/app/api/finance/gl"
Finance,Accounts Payable,false,"ap invoice|supplier invoice","apps/web/src/app/api/finance/ap"
Finance,Accounts Receivable,false,"ar invoice|receipts","apps/web/src/app/api/finance/ar"
Finance,Bank & Cash,false,"cashbook|bank account","apps/web/src/app/api/finance/bank"
Finance,Bank Reconciliation,false,"bank recon|auto-match","apps/web/src/app/api/finance/recon"
Finance,VAT (MTD),true,"hmrc-rti|mtd|vat return","apps/web/src/app/api/integrations/hmrc*"
Finance,Fixed Assets,false,"depreciation|fa register","apps/web/src/app/api/finance/fa"
Finance,Period Close,false,"period close|reopen","apps/web/src/lib/close|/api/finance/close"
Finance,FX Revaluation,false,"fx reval","apps/web/src/app/api/finance/fx"
Finance,Costing,false,"fifo|standard cost","apps/web/src/app/api/finance/costing"

HR & Payroll,Payroll,false,"payroll run","apps/web/src/app/api/payroll"
HR & Payroll,Employees,false,"employee","apps/web/src/app/api/employees"

Inventory & WMS,Items & Lots,false,"items|lots|serial","apps/web/src/app/api/inventory/items"
Inventory & WMS,Warehouses,false,"warehouse|bin","apps/web/src/app/api/inventory/warehouses"
Inventory & WMS,Stock Movements,false,"issue|receipt|adjustment","apps/web/src/app/api/inventory/movements"
Inventory & WMS,Advanced WMS (ASN/Wave/3PL),false,"ASN|wave|3PL","apps/web/src/app/api/integrations/3pl|/api/wms"
Inventory & WMS,Cycle Counting,false,"cycle count","apps/web/src/app/api/wms/count"
Inventory & WMS,Quality (Holds & CAPA),false,"CAPA|quality hold","apps/web/src/app/api/quality|/capa"

Manufacturing,BOM & Routings,false,"bom|routing","apps/web/src/app/api/mfg/bom|/mfg/routings"
Manufacturing,Work Orders,false,"work order|backflush","apps/web/src/app/api/mfg/workorders"
Manufacturing,MRP,false,"mrp plan","apps/web/src/app/api/mfg/mrp"
Manufacturing,Capacity Planning,false,"capacity|bottleneck","apps/web/src/app/api/mfg/capacity"
Manufacturing,APS,false,"aps schedule","apps/web/src/app/api/mfg/aps"
Manufacturing,Maintenance,false,"maintenance","apps/web/src/app/api/mfg/maintenance"
Manufacturing,PLM,false,"plm|change control","apps/web/src/app/api/mfg/plm"

Sales & CRM,Leads & Opportunities,false,"lead|opportunity","apps/web/src/app/api/crm/leads|/crm/opportunities"
Sales & CRM,Quotations & Sales Orders,false,"quote|sales order","apps/web/src/app/api/sales/orders"
Sales & CRM,Returns (RMA),false,"rma","apps/web/src/app/api/returns|/api/rma"
Sales & CRM,CRM Integrations,true,"hubspot status","apps/web/src/app/api/crm/hubspot/status"
Sales & CRM,Marketplace,true,"amazon status|ebay status|shopify","apps/web/src/app/api/integrations/(amazon|ebay|shopify)/status"

Purchasing,Requisitions,false,"requisition","apps/web/src/app/api/purchasing/requisitions"
Purchasing,Purchase Orders,false,"purchase order","apps/web/src/app/api/purchasing/po"
Purchasing,Supplier Invoices & Payments,false,"supplier invoice|ap payment","apps/web/src/app/api/purchasing/invoices|/payments"

Projects,Projects & Tasks,false,"project|task","apps/web/src/app/api/projects"
Projects,Costing & Billing,false,"project invoice|wip","apps/web/src/app/api/projects/billing|/wip"

Compliance & Tax,GDPR Tools & Audit,false,"gdpr export|erase","apps/web/src/app/api/compliance/gdpr"
Compliance & Tax,CIS,false,"cis","apps/web/src/app/api/compliance/cis"

Banking & Billing,Open Banking,true,"open-banking status","apps/web/src/app/api/integrations/open-banking/status"
Banking & Billing,Billing & Metering,false,"usage-based|metering","apps/web/src/app/api/billing"
Banking & Billing,Stripe Payments,true,"billing webhook status|stripe payment","apps/web/src/app/api/billing|/pos/stripe"

Enterprise & Analytics,Intercompany & Consolidation,false,"consolidation|intercompany","apps/web/src/app/api/enterprise/consolidation|/intercompany"
Enterprise & Analytics,Multi-Currency & Multi-Entity,false,"multi-entity|multi-currency","apps/web/src/lib/fx|/api/entities"
Enterprise & Analytics,Analytics & Dashboards,false,"dashboard|analytics","apps/web/src/app/(app)/dashboard|/api/analytics"
Enterprise & Analytics,Observability & SIEM,false,"siem|export logs","apps/web/src/lib/observability|/api/siem"

AI & Automation,Nexa AI Assist,false,"assistant_audit|AI Assist","apps/web/src/lib/ai|/api/ai"
AI & Automation,OCR & Document AI,false,"ocr|document ai","apps/web/src/app/api/ai/ocr"
AI & Automation,Predictive Scenarios,false,"forecast|predictive","apps/web/src/app/api/ai/predictive"
AI & Automation,Workflows & Jobs,false,"job scheduler|workflow","apps/web/src/app/api/jobs|/workflows"
AI & Automation,Notifications,true,"twilio|email notify","apps/web/src/app/api/notify|/integrations/twilio"

Mobile & PWA,Installable PWA,false,"pwa|manifest","apps/web/public/manifest.json|/service-worker"
Mobile & PWA,iOS & Android App,false,"expo|capacitor","apps/mobile|apps/app"
Mobile & PWA,Offline Queue & Push,false,"offline queue|push","apps/web/src/lib/offline|/api/push"

Settings & Connectors,Connectors,true,"status route.*(google|microsoft|stripe|truelayer|hmrc|twilio|shopify|amazon|ebay)","apps/web/src/app/api/integrations|/api/crm/hubspot/status"
Settings & Connectors,API Keys & Rate Limits,false,"rate limit|api keys","apps/web/src/app/api/keys|/lib/rate-limit"
Settings & Connectors,Backups & DR,false,"backup|restore drill|RTO/RPO","scripts/ops|/reports/restore"

Point of Sale (POS),POS Checkout (Stripe Terminal),true,"/api/pos/stripe/webhook|terminal","apps/web/src/app/api/pos"
Point of Sale (POS),POS Receipts,false,"pdf receipt|receipt render","apps/web/src/app/api/pos/reports"
Point of Sale (POS),POS Offline (Park → Sync),false,"park|sync offline","apps/web/src/lib/pos/offline"
Point of Sale (POS),POS Reconciliation,false,"Z report|idempotency","apps/web/src/app/api/pos/reports/z"
Point of Sale (POS),POS Postings,false,"POS_POSTING_ENABLED|posting","apps/web/src/lib/pos/posting"
Point of Sale (POS),POS Reports (X/Z),false,"X/Z totals","apps/web/src/app/api/pos/reports"
CSV

# Write header
{
  echo "# Nexa ERP — Feature Verification"
  echo
  echo "| Category | Feature | Status | Evidence |"
  echo "|---------|---------|:------:|----------|"
} > "$OUT_MD"

# Process features
while IFS=, read -r cat feat requires_keys log_grep code_grep; do
  [[ -z "${cat:-}" ]] && continue
  rk=$(echo "$requires_keys" | tr 'A-Z' 'a-z')

  # Code evidence
  code_ok="no"
  IFS='|' read -r -a code_pats <<< "${code_grep}"
  for pat in "${code_pats[@]}"; do
    [[ -z "${pat:-}" ]] && continue
    if grep -RIlq --exclude-dir=node_modules -- "$pat" "$ROOT"; then
      code_ok="yes"; break
    fi
  done

  # Log evidence
  log_ok="no"
  IFS='|' read -r -a log_pats <<< "${log_grep}"
  for lf in $latest_logs; do
    [[ -z "${lf:-}" ]] && continue
    for pat in "${log_pats[@]}"; do
      [[ -z "${pat:-}" ]] && continue
      if grep -Ei -- "$pat" "$lf" >/dev/null 2>&1; then
        log_ok="yes"; break 2
      fi
    done
  done

  # Status decision (avoid zsh reserved 'status')
  state="✖ Missing"
  [[ "$code_ok" == "yes" ]] && state="Ready"
  [[ "$code_ok" == "yes" && "$log_ok" == "yes" ]] && state="✓ Live"
  [[ "$rk" == "true" && "$state" == "✓ Live" ]] && state="✓ Live (🔑 connected)"
  [[ "$rk" == "true" && "$state" == "Ready" ]] && state="Ready (🔑 needed)"

  evidence="—"
  if [[ "$code_ok" == "yes" || "$log_ok" == "yes" ]]; then
    evidence="$( [[ "$code_ok" == "yes" ]] && echo -n "code"; [[ "$log_ok" == "yes" ]] && echo -n " ${evidence/—/}logs" )"
    evidence="${evidence# }"; [[ -z "$evidence" ]] && evidence="—"
  fi

  echo "| $cat | $feat | $state | $evidence |" >> "$OUT_MD"
done <<< "$FEATURES_CSV"

echo "[ok] Feature verification written to: $OUT_MD"
exec tail -n +1 "$OUT_MD" | sed "s/.*/    &/"
