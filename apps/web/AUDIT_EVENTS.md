# Audit Events (Task 5)

## Authentication
- auth.sign_in (tenantId, actorId, provider)
- auth.sign_out (tenantId, actorId)
- auth.session (tenantId, actorId)
- auth.link_account (tenantId, actorId, provider)

Emitted when `AUTH_AUDIT_ENABLED=true` in production. Source: `apps/web/app/api/auth/[...nextauth]/route.ts` via `auditEvent`.

## Finance
- finance.invoice.approved (tenantId, actorId, invoiceId)
- finance.invoice.paid (tenantId, actorId, invoiceId, entryId, method, reference)

## Inventory
- inventory.grn.received (tenantId, actorId, sku, qty)

## Manufacturing
- mfg.workorder.consumed_bom (tenantId, actorId, workOrderId, itemCode, qty)

## POS
- pos.sale.finalised (tenantId, actorId, saleId, entryId, total)

## Projects
- projects.timesheets.rolled_up (tenantId, actorId, projects)

All audit writes go to `AuditLog` when available, and to Redis (best-effort) and console fallback.

