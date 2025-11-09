# Reversal Runbook — Finance Payments & POS Sales

This runbook outlines how to reverse a payment or POS finalisation, ensuring audit captures and GL stays balanced.

## Finance payment reversal
1. Identify the original CustomerInvoice `number` and JournalEntry `docRef` (`AR:<invoiceNumber>`).
2. Post a reversing journal with swapped debits/credits:
   - Debit AR, Credit Revenue and VAT with same amounts as the original.
3. Record an audit entry `finance.invoice.reversed` with `{ tenantId, actorId, invoiceId, originalEntryId, reversalEntryId }`.
4. Set invoice status back to `approved` or `part_paid` depending on remaining balance.

## POS sale reversal
1. Identify the sale by `saleNumber` and JournalEntry `docRef` (`POS:<saleNumber>`).
2. Post a reversing journal:
   - Credit Cash, Debit Revenue, mirroring the original totals.
3. Record an audit entry `pos.sale.reversed` with `{ tenantId, actorId, saleId, originalEntryId, reversalEntryId }`.
4. Mark sale as `void` (or create a refund flow if partial).

Notes:
- Always link reversal entries via `docRef` and include cross-references in audit metadata.
- If VAT treatment differs, post adjustments as separate lines for traceability.

