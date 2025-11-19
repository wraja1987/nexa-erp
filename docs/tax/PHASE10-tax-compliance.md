Last updated: 2025-11-16

Purpose
- Implement Tax + Compliance on locked schema with safe subsets and clear schema-gap handling.

Schema inventory (from prisma/schema.prisma)
- VatReturn: { id, vrn, periodKey, start, end, due, status, totalDue?, submittedAt?, createdAt, updatedAt } (Note: no tenantId field).
- CustomerInvoice: { id, tenantId, number, customerId, currency, total, status, issuedAt, dueAt, ... }.
- SupplierBill: { id, tenantId, number, supplierId, currency, total, status, receivedAt, dueAt, ... }.
- JournalEntry / JournalLine / Account: available for GL.
- No explicit TaxCode/TaxRate models; no tax breakdown fields on invoices/journal lines discovered.
- No HMRC tokens/submission log models; no GCC e-invoice specific models/fields.

Available vs Missing per Phase 10 bullet
- VAT pipelines:
  - Available: Basic totals from CustomerInvoice and GL; VatReturn table exists but lacks tenantId → unsafe to read/write per-tenant.
  - Missing: Tax breakdown fields, per-line VAT, safe tenant linkage for VatReturn.
  - Implement now: buildVatSummary returns supported:false (schema gap). listVatReturns returns [] with meta.supported:false (missing tenant link). createDraftVatReturn → 501.
- HMRC MTD:
  - Available: None specific (no HMRC tokens/submission logs).
  - Implement now: buildMtdPayload returns supported:false (no VatReturn per-tenant). recordMtdSubmissionResult → 501.
- GCC e-invoice:
  - Available: CustomerInvoice header data only; lacks GCC-required fields (seller tax ID, buyer tax ID, line-level taxes).
  - Implement now: buildGccEinvoicePayload returns supported:false with minimal context.
- Audit pack generator:
  - Available: GL Trial Balance via JournalEntry/Line; can assemble TB. AR/AP aging lacks reliable fields; VAT summary unsupported.
  - Implement now: buildAuditPack returns TB plus unsupported entries for AR/AP aging and VAT.

What is implemented now
- Read-only VAT summary (unsupported flag), VatReturn list (unsupported), HMRC MTD preview (unsupported), GCC e-invoice preview (unsupported), Audit pack JSON (TB only; others flagged unsupported).
- All unsupported actions return 501 with a clear message; no external submissions or file exports.


