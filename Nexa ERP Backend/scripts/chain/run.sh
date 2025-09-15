#!/usr/bin/env bash
set -Eeuo pipefail
source "$(dirname "$0")/helpers.sh"

ROOT_DIR="$(cd .. && pwd)"
ENV_FILE="$ROOT_DIR/../apps/web/.env.local"

ensure_env_file "$ENV_FILE"

print_header "Pre-Build Audit (mandatory)"
if ! audit_after_phase "00" "Pre-Build_Audit"; then
  echo "[fatal] Pre-Build Audit failed. Fix issues and re-run."; exit 1;
fi

# Phase runner with optional key prompts
run_phase(){
  local no="$1"; local name="$2"

  case "$no" in
    08)
      # Compliance & Tax — HMRC sandbox keys to test submit
      require_keys "$ENV_FILE" "Phase 08 — Compliance & Tax (HMRC VAT)" HMRC_CLIENT_ID HMRC_CLIENT_SECRET
      ;;
    09)
      # Banking & Billing — TrueLayer + Stripe
      require_keys "$ENV_FILE" "Phase 09 — Banking & Billing (Open Banking + Stripe)" TRUELAYER_CLIENT_ID TRUELAYER_CLIENT_SECRET STRIPE_PUBLISHABLE_KEY STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET
      ;;
    10)
      # POS — Stripe Terminal + webhook
      require_keys "$ENV_FILE" "Phase 10 — POS (Stripe Terminal)" STRIPE_PUBLISHABLE_KEY STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET
      ;;
    12)
      # AI & Automation — BYOK/Twilio if used
      echo "[info] Optional keys for Phase 12 (AI & Automation): Twilio + BYOK provider keys."
      ;;
    14)
      # Settings & Connectors — OAuth + marketplaces
      echo "[info] Phase 14 requires connector keys if you want live tests:"
      echo "      - Google/Microsoft OAuth, Shopify/Amazon/eBay, HMRC as needed."
      ;;
  esac

  if ! audit_after_phase "$no" "$name"; then
    echo "[fatal] Phase $no — $name failed. Fix and re-run: scripts/chain/run.sh $no"; exit 1;
  fi
}

# Phases (1..15)
run_phase "01" "Core Platform (Auth, Tenants, RBAC/SoD, MFA, Audit Logs, AI Logs)"
run_phase "02" "Finance (GL, AP, AR, Bank & Cash, Reconciliation, VAT, Fixed Assets, Period Close, FX, Costing)"
run_phase "03" "Inventory & WMS (Items, Lots, Warehouses, Movements, ASN/Wave/3PL, Cycle Count, Quality/CAPA)"
run_phase "04" "Manufacturing (BOM & Routings, Work Orders, MRP, Capacity, APS, Maintenance, PLM)"
run_phase "05" "Sales & CRM (Leads, Opportunities, Quotes, Sales Orders, Returns, CRM Integrations, Marketplace)"
run_phase "06" "Purchasing (Requisitions, POs, Supplier Invoices & Payments)"
run_phase "07" "Projects (Projects & Tasks, Costing & Billing)"
run_phase "08" "Compliance & Tax (GDPR Tools & Audit, CIS, VAT)"
run_phase "09" "Banking & Billing (Open Banking, Billing & Metering, Stripe Payments)"
run_phase "10" "POS (Stripe Terminal: Intent, Capture, Refund + Webhooks, Reconciliation, X/Z)"
run_phase "11" "Enterprise & Analytics (Intercompany, Consolidation, Multi-Entity/Currency, Dashboards, SIEM)"
run_phase "12" "AI & Automation (Nexa AI Assist, OCR/Doc AI, Predictive, Workflows/Jobs, Notifications)"
run_phase "13" "Mobile & PWA (PWA install, Offline queue, Push endpoints)"
run_phase "14" "Settings & Connectors (M365, Google, HMRC VAT, TrueLayer, Shopify, Amazon, eBay, API Keys, Rate Limits, Backups/DR)"
run_phase "15" "Hardening & Release (CSP nonces, SoD matrix tests, Restore drill, Webhook replay harness, Data-retention jobs, Final Build)"

print_header "All phases completed — reports written to $(pwd)/reports"
