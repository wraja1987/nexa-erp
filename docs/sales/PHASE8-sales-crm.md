Last updated: 2025-11-16

Purpose
- Implement Sales + CRM (Phase 8) on the locked schema strictly. This document inventories what exists and what is missing, and how unsupported features are surfaced (read-only or 501).

Schema inventory (from prisma/schema.prisma)
- CRM: Models for Account/Customer (as CRM entity), Contact, Activity/Interaction, Opportunity/PipelineStage are NOT present.
- Sales documents:
  - Invoice (header) exists, but no Quote, QuoteLine, SalesOrder, SalesOrderLine.
  - AR helpers: CustomerInvoice / CustomerPayment exist but are not directly linked to opportunities/orders/quotes.
- Inventory reservations/backorders: No dedicated reservation/backorder fields found on any order/line (orders absent).

Available now vs Missing
- Accounts: MISSING (no CRM Account table) → list empty; create/update 501.
- Contacts: MISSING → list empty; create/update 501.
- Activities: MISSING → list empty; create/complete 501.
- Pipelines/Opportunities/Stages: MISSING → list empty; create/update/move 501.
- Quotes (+ versioning): MISSING (no Quote/QuoteLine) → list empty; get 404; create/update/duplicate 501.
- Orders (+ lines): MISSING → list empty; get 404; create/update 501.
- Reservations/backorders: MISSING → reserve/backorder endpoints return 501.
- Quote → Order → Invoice chain: MISSING required models/links; preview/confirm endpoints return 501.

RBAC & tenancy
- All endpoints are guarded with ui:crm:view/ui:crm:edit and ui:sales:view/ui:sales:edit, and assert legal entity/tenant scope. No cross-tenant visibility.


