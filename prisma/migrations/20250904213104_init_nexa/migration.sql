-- CreateEnum
CREATE TYPE "public"."QualityStatus" AS ENUM ('open', 'accepted', 'rejected', 'released', 'in_progress', 'completed');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaSecret" TEXT;

-- CreateTable
CREATE TABLE "public"."PeriodClose" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "closedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeriodClose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoaTemplate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoaTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoaTemplateLine" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "CoaTemplateLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BankAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BankStatementLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reference" TEXT,
    "reconciled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankStatementLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BankReconciliation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "statementBal" DECIMAL(65,30) NOT NULL,
    "reconciledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JournalEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "docRef" TEXT,
    "memo" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JournalLine" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "credit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerInvoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupplierBill" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FixedAsset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL,
    "salvage" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "usefulLifeM" INTEGER NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL,
    "disposedAt" TIMESTAMP(3),
    "disposalProceeds" DECIMAL(65,30),
    "disposalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DepreciationSchedule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "posted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepreciationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FixedAssetDisposal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "disposedAt" TIMESTAMP(3) NOT NULL,
    "proceeds" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "gainLoss" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedAssetDisposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryLot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QualityInspection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "status" "public"."QualityStatus" NOT NULL DEFAULT 'open',
    "findings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QualityHold" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT,
    "lotId" TEXT,
    "reason" TEXT NOT NULL,
    "status" "public"."QualityStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Capa" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rootCause" TEXT,
    "actions" JSONB,
    "ownerId" TEXT,
    "status" "public"."QualityStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupplierPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HubspotContact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "hsId" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubspotContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HubspotCompany" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "hsId" TEXT NOT NULL,
    "name" TEXT,
    "domain" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubspotCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HubspotDeal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "hsId" TEXT NOT NULL,
    "name" TEXT,
    "amount" DECIMAL(65,30),
    "stage" TEXT,
    "closeDate" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubspotDeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PeriodClose_tenantId_periodStart_periodEnd_idx" ON "public"."PeriodClose"("tenantId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "CoaTemplate_code_key" ON "public"."CoaTemplate"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_tenantId_code_key" ON "public"."BankAccount"("tenantId", "code");

-- CreateIndex
CREATE INDEX "BankStatementLine_tenantId_bankAccountId_date_idx" ON "public"."BankStatementLine"("tenantId", "bankAccountId", "date");

-- CreateIndex
CREATE INDEX "BankReconciliation_tenantId_bankAccountId_fromDate_toDate_idx" ON "public"."BankReconciliation"("tenantId", "bankAccountId", "fromDate", "toDate");

-- CreateIndex
CREATE UNIQUE INDEX "Account_tenantId_code_key" ON "public"."Account"("tenantId", "code");

-- CreateIndex
CREATE INDEX "JournalEntry_tenantId_postedAt_idx" ON "public"."JournalEntry"("tenantId", "postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInvoice_number_key" ON "public"."CustomerInvoice"("number");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierBill_number_key" ON "public"."SupplierBill"("number");

-- CreateIndex
CREATE INDEX "FixedAsset_tenantId_assetCode_idx" ON "public"."FixedAsset"("tenantId", "assetCode");

-- CreateIndex
CREATE INDEX "DepreciationSchedule_tenantId_assetId_period_idx" ON "public"."DepreciationSchedule"("tenantId", "assetId", "period");

-- CreateIndex
CREATE INDEX "FixedAssetDisposal_tenantId_assetId_disposedAt_idx" ON "public"."FixedAssetDisposal"("tenantId", "assetId", "disposedAt");

-- CreateIndex
CREATE INDEX "InventoryLot_tenantId_sku_receivedAt_idx" ON "public"."InventoryLot"("tenantId", "sku", "receivedAt");

-- CreateIndex
CREATE INDEX "QualityInspection_tenantId_docType_docId_idx" ON "public"."QualityInspection"("tenantId", "docType", "docId");

-- CreateIndex
CREATE INDEX "QualityHold_tenantId_sku_idx" ON "public"."QualityHold"("tenantId", "sku");

-- CreateIndex
CREATE INDEX "Capa_tenantId_status_idx" ON "public"."Capa"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CustomerPayment_tenantId_invoiceId_idx" ON "public"."CustomerPayment"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "SupplierPayment_tenantId_billId_idx" ON "public"."SupplierPayment"("tenantId", "billId");

-- CreateIndex
CREATE UNIQUE INDEX "HubspotContact_hsId_key" ON "public"."HubspotContact"("hsId");

-- CreateIndex
CREATE INDEX "HubspotContact_tenantId_hsId_idx" ON "public"."HubspotContact"("tenantId", "hsId");

-- CreateIndex
CREATE UNIQUE INDEX "HubspotCompany_hsId_key" ON "public"."HubspotCompany"("hsId");

-- CreateIndex
CREATE INDEX "HubspotCompany_tenantId_hsId_idx" ON "public"."HubspotCompany"("tenantId", "hsId");

-- CreateIndex
CREATE UNIQUE INDEX "HubspotDeal_hsId_key" ON "public"."HubspotDeal"("hsId");

-- CreateIndex
CREATE INDEX "HubspotDeal_tenantId_hsId_idx" ON "public"."HubspotDeal"("tenantId", "hsId");

-- AddForeignKey
ALTER TABLE "public"."CoaTemplateLine" ADD CONSTRAINT "CoaTemplateLine_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."CoaTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BankStatementLine" ADD CONSTRAINT "BankStatementLine_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "public"."BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JournalLine" ADD CONSTRAINT "JournalLine_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JournalLine" ADD CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DepreciationSchedule" ADD CONSTRAINT "DepreciationSchedule_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."FixedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FixedAssetDisposal" ADD CONSTRAINT "FixedAssetDisposal_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."FixedAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
