# POS Readiness
- Stripe Terminal connection + live PIs.
- Webhook idempotency + reconciliation.
- Inventory/GL postings toggle: POS_POSTING_ENABLED=true.
- Offline park→sync.
- Receipts (HTML/PDF), X/Z reports, RBAC.

## Go live
Add Stripe keys in .env, pair reader, test cash/card/refund/X/Z/offline sync/receipt.
