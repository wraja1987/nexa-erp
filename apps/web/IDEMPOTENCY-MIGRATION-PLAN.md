# Idempotency Persistence — Migration Plan (Carry to Task 2)

Goal: enforce durable idempotency beyond Redis for finance payments and POS finalise.

## Changes
1) CustomerPayment: unique reference per tenant+invoice
- Add unique index: `@@unique([tenantId, invoiceId, reference])`

2) JournalEntry: unique document reference per tenant
- Add unique index: `@@unique([tenantId, docRef])`

3) (Optional, generic) IdempotencyKey table
```prisma
model IdempotencyKey {
  id        String   @id @default(cuid())
  tenantId  String
  scope     String   // e.g. "finance.pay" | "pos.finalise"
  key       String
  response  Json
  createdAt DateTime @default(now())
  @@unique([tenantId, scope, key])
}
```

## Commands
- prisma migrate: `pnpm -w prisma migrate dev -n "task2_idempotency_indexes"`
- generate: `pnpm -w prisma generate`

## Backfill/Validation
- Scan for duplicate `(tenantId, invoiceId, reference)` and `(tenantId, docRef)` pairs; dedupe by retaining earliest.
- Populate `IdempotencyKey` for recent Redis entries if retained (optional).

## Apply (Neon/staging)
- Apply migration to staging Neon; verify `EXPLAIN` still uses indexes for JournalEntry lookups by docRef.

## Code hook (already present)
- Finance pay checks for duplicate reference; schema unique will enforce at DB level.
- POS finalise is idempotent by design (status check) and will also benefit from `JournalEntry.docRef` uniqueness.

