-- Bootstrap migration for Nexa ERP (idempotent)
-- Requires Postgres 14+.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "Invoice" (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  "customerId" TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "InvoiceLine" (
  id TEXT PRIMARY KEY,
  "invoiceId" TEXT NOT NULL,
  sku TEXT NOT NULL,
  qty INTEGER NOT NULL,
  price NUMERIC(14,2) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");

CREATE TABLE IF NOT EXISTS "PurchaseOrder" (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  "supplierId" TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "POLine" (
  id TEXT PRIMARY KEY,
  "poId" TEXT NOT NULL,
  sku TEXT NOT NULL,
  qty INTEGER NOT NULL,
  price NUMERIC(14,2) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "POLine_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "POLine_poId_idx" ON "POLine"("poId");

-- Additional helpful indexes
CREATE INDEX IF NOT EXISTS "Invoice_createdAt_desc_idx" ON "Invoice"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"(status);

