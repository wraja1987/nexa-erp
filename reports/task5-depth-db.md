# Task 5 — Depth (DB & Seed)

Date: $(date)

## Prisma
- generate: OK (exit 0)
- db push: OK (applied using nexa user; postgres fallback available)
- seed: OK (Phase‑5 seed executed idempotently)

## Core Tables Present (schema)
- CustomerInvoice, JournalEntry, JournalLine
- InventoryItem, BomItem, WorkOrder
- PosSale, Store
- KpiSnapshot
- AuditLog

## Phase‑5 Tenant
- Tenant id: t-phase5-demo-0001
- Smoke counts available via DB; ensure non‑zero rows exist for seeded artifacts (invoices, inventory item, work order, pos sale, KPI snapshot, audit logs).


