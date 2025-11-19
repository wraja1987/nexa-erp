-- DropIndex
DROP INDEX "public"."User_tenant_id_idx";
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "access_token" TEXT,
ADD COLUMN     "expires_at" INTEGER,
ADD COLUMN     "id_token" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerAccountId" TEXT,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "scope" TEXT,
ADD COLUMN     "session_state" TEXT,
ADD COLUMN     "token_type" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "code" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;
-- AlterTable
ALTER TABLE "Allowance" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "ConsolidationMap" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "Deduction" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "EntityExt" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "IntercompanyTxn" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "JournalLine" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "PoLine" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "PosSale" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "sessionId" TEXT;
-- AlterTable
ALTER TABLE "RoutingStep" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "mfaEnabled",
DROP COLUMN "mfaSecret",
DROP COLUMN "passwordHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfa_secret" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'USER',
ALTER COLUMN "active" DROP NOT NULL;
-- AlterTable
ALTER TABLE "VatReturn" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "WebhookEvent" ADD COLUMN     "tenantId" TEXT NOT NULL;
-- CreateTable
CREATE TABLE "WorkCenter" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" DECIMAL(65,30),
    "costRate" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkCenter_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "WorkOrderMaterialIssue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lotId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'issue',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT,
    "notes" TEXT,
    CONSTRAINT "WorkOrderMaterialIssue_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ScrapRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "cost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT,
    CONSTRAINT "ScrapRecord_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "VarianceReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "standardCost" DECIMAL(65,30) NOT NULL,
    "actualCost" DECIMAL(65,30) NOT NULL,
    "variance" DECIMAL(65,30) NOT NULL,
    "variancePercent" DECIMAL(65,30) NOT NULL,
    "reason" TEXT,
    "posted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    CONSTRAINT "VarianceReport_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "StockMove" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "warehouseId" TEXT,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "type" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "lotId" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movedBy" TEXT,
    "sourceEventId" TEXT,
    CONSTRAINT "StockMove_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CycleCountPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    CONSTRAINT "CycleCountPlan_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CycleCountLine" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "locationId" TEXT,
    "expectedQty" DECIMAL(65,30) NOT NULL,
    "countedQty" DECIMAL(65,30),
    "varianceQty" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "countedAt" TIMESTAMP(3),
    "countedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CycleCountLine_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "orderId" TEXT,
    "orderType" TEXT,
    "warehouseId" TEXT NOT NULL,
    "carrier" TEXT,
    "tracking" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ShipmentLine" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "pickedQty" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "packedQty" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shippedQty" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShipmentLine_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PutawayTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "grnId" TEXT,
    "sku" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedTo" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PutawayTask_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT,
    "provider" TEXT,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "user_id" TEXT,
    "provider_account_id" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "auth_debug" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "event" TEXT,
    "provider" TEXT,
    "account_id" TEXT,
    "user_id" TEXT,
    "email" TEXT,
    "error" TEXT,
    "raw" JSONB,
    CONSTRAINT "auth_debug_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "session_token" TEXT,
    "user_id" TEXT,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "tenant_keys" (
    "tenant_id" TEXT NOT NULL,
    "enc_key" BYTEA NOT NULL,
    "alg" TEXT NOT NULL DEFAULT 'AES-256-GCM',
    "version" INTEGER NOT NULL DEFAULT 1,
    "rotated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tenant_keys_pkey" PRIMARY KEY ("tenant_id")
);
-- CreateTable
CREATE TABLE "verification_token" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);
-- CreateTable
CREATE TABLE "BlanketPO" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlanketPO_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "BlanketPOLine" (
    "id" TEXT NOT NULL,
    "blanketPoId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlanketPOLine_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "BlanketPORelease" (
    "id" TEXT NOT NULL,
    "blanketPoId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlanketPORelease_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SupplierContract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "terms" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupplierContract_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SupplierContractTier" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qtyMin" DECIMAL(65,30) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupplierContractTier_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "LandedCost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "poId" TEXT,
    "asnId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "allocatedTo" TEXT NOT NULL DEFAULT 'inventory',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LandedCost_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SupplierPerformance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "otif" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quality" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupplierPerformance_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ProjectPhase" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectPhase_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Timesheet" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ProjectRetainer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "applied" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectRetainer_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ProjectInvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "projectId" TEXT,
    "phaseId" TEXT,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectInvoiceLine_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "WipLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT,
    "type" TEXT NOT NULL,
    "referenceId" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billed" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WipLedger_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "BillingSchedule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phaseId" TEXT,
    "type" TEXT NOT NULL,
    "frequency" TEXT,
    "amount" DECIMAL(65,30),
    "rate" DECIMAL(65,30),
    "nextBillDate" TIMESTAMP(3),
    "lastBillDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BillingSchedule_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CrmAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postcode" TEXT,
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "CrmAccount_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CrmContact" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "CrmContact_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactId" TEXT,
    "accountId" TEXT,
    "opportunityId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CrmOpportunity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT,
    "contactId" TEXT,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'qualification',
    "value" DECIMAL(65,30),
    "amount" DECIMAL(65,30) DEFAULT 0,
    "probability" DECIMAL(65,30) DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "expectedCloseDate" TIMESTAMP(3),
    "actualCloseDate" TIMESTAMP(3),
    "closeDate" TIMESTAMP(3),
    "ownerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "source" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "CrmOpportunity_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "OpportunityStageHistory" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "probability" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT,
    CONSTRAINT "OpportunityStageHistory_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SalesQuote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "number" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "validUntil" TIMESTAMP(3),
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "SalesQuote_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SalesQuoteLine" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SalesQuoteLine_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "quoteId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SalesOrderLine" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "reservedQty" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "backorderQty" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SalesOrderLine_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT,
    "orderLineId" TEXT,
    "sku" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "warehouseId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PosSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "openedBy" TEXT NOT NULL,
    "closedBy" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "openingFloat" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "closingFloat" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PosSession_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PosDrawer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PosDrawer_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PosPromotion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "conditions" JSONB,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PosPromotion_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PosVariance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expected" DECIMAL(65,30) NOT NULL,
    "actual" DECIMAL(65,30) NOT NULL,
    "variance" DECIMAL(65,30) NOT NULL,
    "reason" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PosVariance_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CashMovement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ZReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "totalSales" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalDiscounts" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalTax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCash" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCard" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalOther" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "openingFloat" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "closingFloat" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "variance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "receiptCount" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT,
    CONSTRAINT "ZReport_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "TaxCode" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaxCode_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "taxCodeId" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "TaxGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaxGroup_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "TaxRule" (
    "id" TEXT NOT NULL,
    "taxGroupId" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "productCode" TEXT,
    "customerCode" TEXT,
    "category" TEXT,
    "rate" DECIMAL(65,30) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaxRule_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "TaxJurisdiction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "taxType" TEXT NOT NULL,
    "rules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaxJurisdiction_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "HmrcMtdSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vatReturnId" TEXT,
    "submissionId" TEXT,
    "status" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HmrcMtdSubmission_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "GccEinvoicePayload" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GccEinvoicePayload_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "MetricPoint" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "dimensions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetricPoint_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "MetricsSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetricsSnapshot_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PartnerTenant" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartnerTenant_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PartnerRevenueShare" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PartnerRevenueShare_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "TenantConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "locale" TEXT DEFAULT 'en-GB',
    "timezone" TEXT DEFAULT 'Europe/London',
    "currency" TEXT DEFAULT 'GBP',
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TenantConfig_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Practice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Pcn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Pcn_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PracticePcn" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "pcnId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticePcn_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "HealthcareRotaHeader" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HealthcareRotaHeader_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "HealthcareRotaShift" (
    "id" TEXT NOT NULL,
    "headerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HealthcareRotaShift_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "HealthcareRotaAssignment" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "arrsRoleId" TEXT,
    "locumId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HealthcareRotaAssignment_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ArrsRole" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArrsRole_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ArrsAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArrsAssignment_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "LocumAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "rate" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LocumAssignment_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "HealthcareClaim" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HealthcareClaim_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ArrsClaim" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pcnId" TEXT NOT NULL,
    "practiceId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArrsClaim_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "deletedAt" TIMESTAMP(3),
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "errorRows" INTEGER NOT NULL DEFAULT 0,
    "undoToken" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ImportJobItem" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ImportJobItem_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PriceList" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PriceListItem" (
    "id" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PriceListItem_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextAttemptAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "EventSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "sink" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EventSubscription_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "TenantKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "keyMaterial" BYTEA NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'AES-256-GCM',
    "rotatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TenantKey_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "BackupPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BackupPolicy_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "BackupRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "policyId" TEXT,
    "status" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BackupRun_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "WorkflowInstance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "currentStep" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkflowInstance_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "WorkflowHistory" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "fromStep" TEXT,
    "toStep" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowHistory_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CustomFieldDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomFieldDefinition_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "CustomFieldValue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomFieldValue_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "SafetyStock" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "warehouseId" TEXT,
    "minQty" DECIMAL(65,30) NOT NULL,
    "maxQty" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SafetyStock_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PlanningSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "horizonMonths" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlanningSnapshot_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "PlanRecommendation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlanRecommendation_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "departmentId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "UserDepartment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserDepartment_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "UserTeam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserTeam_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "module" TEXT,
    "status" TEXT NOT NULL DEFAULT 'running',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "AgentStep" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "AgentStep_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "AgentConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "module" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AgentConfig_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "DimDate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isWeekend" BOOLEAN NOT NULL,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "fiscalYear" INTEGER,
    "fiscalQuarter" INTEGER,
    CONSTRAINT "DimDate_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "DimTenant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "industry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DimTenant_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "DimCustomer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "industry" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DimCustomer_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "DimProduct" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "brand" TEXT,
    "unitOfMeasure" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DimProduct_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "DimLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "locationId" TEXT,
    "warehouseCode" TEXT NOT NULL,
    "locationCode" TEXT,
    "warehouseName" TEXT NOT NULL,
    "locationName" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DimLocation_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "DimProject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerId" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DimProject_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "DimChannel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DimChannel_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "FactInvoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dateId" TEXT NOT NULL,
    "tenantDimId" TEXT NOT NULL,
    "customerDimId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "tax" DECIMAL(65,30) NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL,
    "net" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FactInvoice_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "FactOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dateId" TEXT NOT NULL,
    "tenantDimId" TEXT NOT NULL,
    "customerDimId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FactOrder_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "FactReceipt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dateId" TEXT NOT NULL,
    "tenantDimId" TEXT NOT NULL,
    "customerDimId" TEXT,
    "channelDimId" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL,
    "tax" DECIMAL(65,30) NOT NULL,
    "net" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FactReceipt_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "FactProjectWip" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dateId" TEXT NOT NULL,
    "tenantDimId" TEXT NOT NULL,
    "projectDimId" TEXT NOT NULL,
    "customerDimId" TEXT,
    "wipLedgerId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "billed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FactProjectWip_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "FactInventoryMovement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dateId" TEXT NOT NULL,
    "tenantDimId" TEXT NOT NULL,
    "productDimId" TEXT NOT NULL,
    "locationDimId" TEXT NOT NULL,
    "stockMoveId" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL,
    "totalCost" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FactInventoryMovement_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "FactWorkOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dateId" TEXT NOT NULL,
    "tenantDimId" TEXT NOT NULL,
    "productDimId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "workOrderNumber" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "materialCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "labourCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "overheadCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FactWorkOrder_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "WorkCenter_code_key" ON "WorkCenter"("code");
-- CreateIndex
CREATE INDEX "WorkCenter_tenantId_code_idx" ON "WorkCenter"("tenantId", "code");
-- CreateIndex
CREATE INDEX "WorkCenter_tenantId_status_idx" ON "WorkCenter"("tenantId", "status");
-- CreateIndex
CREATE INDEX "WorkOrderMaterialIssue_tenantId_workOrderId_idx" ON "WorkOrderMaterialIssue"("tenantId", "workOrderId");
-- CreateIndex
CREATE INDEX "WorkOrderMaterialIssue_tenantId_sku_idx" ON "WorkOrderMaterialIssue"("tenantId", "sku");
-- CreateIndex
CREATE INDEX "WorkOrderMaterialIssue_tenantId_issuedAt_idx" ON "WorkOrderMaterialIssue"("tenantId", "issuedAt");
-- CreateIndex
CREATE INDEX "ScrapRecord_tenantId_workOrderId_idx" ON "ScrapRecord"("tenantId", "workOrderId");
-- CreateIndex
CREATE INDEX "ScrapRecord_tenantId_sku_idx" ON "ScrapRecord"("tenantId", "sku");
-- CreateIndex
CREATE INDEX "VarianceReport_tenantId_workOrderId_idx" ON "VarianceReport"("tenantId", "workOrderId");
-- CreateIndex
CREATE INDEX "VarianceReport_tenantId_posted_idx" ON "VarianceReport"("tenantId", "posted");
-- CreateIndex
CREATE INDEX "VarianceReport_tenantId_createdAt_idx" ON "VarianceReport"("tenantId", "createdAt");
-- CreateIndex
CREATE INDEX "StockMove_tenantId_sku_idx" ON "StockMove"("tenantId", "sku");
-- CreateIndex
CREATE INDEX "StockMove_tenantId_warehouseId_idx" ON "StockMove"("tenantId", "warehouseId");
-- CreateIndex
CREATE INDEX "StockMove_tenantId_type_idx" ON "StockMove"("tenantId", "type");
-- CreateIndex
CREATE INDEX "StockMove_tenantId_sourceType_sourceId_idx" ON "StockMove"("tenantId", "sourceType", "sourceId");
-- CreateIndex
CREATE INDEX "StockMove_tenantId_movedAt_idx" ON "StockMove"("tenantId", "movedAt");
-- CreateIndex
CREATE INDEX "StockMove_tenantId_lotId_idx" ON "StockMove"("tenantId", "lotId");
-- CreateIndex
CREATE INDEX "CycleCountPlan_tenantId_warehouseId_idx" ON "CycleCountPlan"("tenantId", "warehouseId");
-- CreateIndex
CREATE INDEX "CycleCountPlan_tenantId_status_idx" ON "CycleCountPlan"("tenantId", "status");
-- CreateIndex
CREATE INDEX "CycleCountPlan_tenantId_startDate_idx" ON "CycleCountPlan"("tenantId", "startDate");
-- CreateIndex
CREATE INDEX "CycleCountLine_planId_idx" ON "CycleCountLine"("planId");
-- CreateIndex
CREATE INDEX "CycleCountLine_planId_status_idx" ON "CycleCountLine"("planId", "status");
-- CreateIndex
CREATE UNIQUE INDEX "Shipment_number_key" ON "Shipment"("number");
-- CreateIndex
CREATE INDEX "Shipment_tenantId_orderId_orderType_idx" ON "Shipment"("tenantId", "orderId", "orderType");
-- CreateIndex
CREATE INDEX "Shipment_tenantId_warehouseId_idx" ON "Shipment"("tenantId", "warehouseId");
-- CreateIndex
CREATE INDEX "Shipment_tenantId_status_idx" ON "Shipment"("tenantId", "status");
-- CreateIndex
CREATE INDEX "ShipmentLine_shipmentId_idx" ON "ShipmentLine"("shipmentId");
-- CreateIndex
CREATE UNIQUE INDEX "ShipmentLine_shipmentId_lineNo_key" ON "ShipmentLine"("shipmentId", "lineNo");
-- CreateIndex
CREATE INDEX "PutawayTask_tenantId_status_idx" ON "PutawayTask"("tenantId", "status");
-- CreateIndex
CREATE INDEX "PutawayTask_tenantId_assignedTo_idx" ON "PutawayTask"("tenantId", "assignedTo");
-- CreateIndex
CREATE INDEX "PutawayTask_tenantId_grnId_idx" ON "PutawayTask"("tenantId", "grnId");
-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
-- CreateIndex
CREATE UNIQUE INDEX "verification_token_token_key" ON "verification_token"("token");
-- CreateIndex
CREATE UNIQUE INDEX "verification_token_identifier_token_key" ON "verification_token"("identifier", "token");
-- CreateIndex
CREATE UNIQUE INDEX "BlanketPO_number_key" ON "BlanketPO"("number");
-- CreateIndex
CREATE INDEX "BlanketPO_tenantId_supplierId_idx" ON "BlanketPO"("tenantId", "supplierId");
-- CreateIndex
CREATE INDEX "BlanketPOLine_blanketPoId_idx" ON "BlanketPOLine"("blanketPoId");
-- CreateIndex
CREATE UNIQUE INDEX "BlanketPORelease_number_key" ON "BlanketPORelease"("number");
-- CreateIndex
CREATE INDEX "BlanketPORelease_blanketPoId_idx" ON "BlanketPORelease"("blanketPoId");
-- CreateIndex
CREATE UNIQUE INDEX "SupplierContract_code_key" ON "SupplierContract"("code");
-- CreateIndex
CREATE INDEX "SupplierContract_tenantId_supplierId_idx" ON "SupplierContract"("tenantId", "supplierId");
-- CreateIndex
CREATE INDEX "SupplierContractTier_contractId_sku_idx" ON "SupplierContractTier"("contractId", "sku");
-- CreateIndex
CREATE INDEX "LandedCost_tenantId_poId_idx" ON "LandedCost"("tenantId", "poId");
-- CreateIndex
CREATE INDEX "LandedCost_tenantId_asnId_idx" ON "LandedCost"("tenantId", "asnId");
-- CreateIndex
CREATE INDEX "SupplierPerformance_tenantId_supplierId_periodStart_periodE_idx" ON "SupplierPerformance"("tenantId", "supplierId", "periodStart", "periodEnd");
-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");
-- CreateIndex
CREATE INDEX "Project_tenantId_customerId_idx" ON "Project"("tenantId", "customerId");
-- CreateIndex
CREATE INDEX "ProjectPhase_projectId_idx" ON "ProjectPhase"("projectId");
-- CreateIndex
CREATE INDEX "ProjectTask_projectId_phaseId_idx" ON "ProjectTask"("projectId", "phaseId");
-- CreateIndex
CREATE INDEX "Timesheet_tenantId_projectId_employeeId_date_idx" ON "Timesheet"("tenantId", "projectId", "employeeId", "date");
-- CreateIndex
CREATE INDEX "ProjectRetainer_tenantId_projectId_idx" ON "ProjectRetainer"("tenantId", "projectId");
-- CreateIndex
CREATE INDEX "ProjectInvoiceLine_invoiceId_projectId_idx" ON "ProjectInvoiceLine"("invoiceId", "projectId");
-- CreateIndex
CREATE INDEX "WipLedger_tenantId_projectId_phaseId_idx" ON "WipLedger"("tenantId", "projectId", "phaseId");
-- CreateIndex
CREATE INDEX "WipLedger_tenantId_projectId_billed_idx" ON "WipLedger"("tenantId", "projectId", "billed");
-- CreateIndex
CREATE INDEX "WipLedger_tenantId_invoiceId_idx" ON "WipLedger"("tenantId", "invoiceId");
-- CreateIndex
CREATE INDEX "BillingSchedule_tenantId_projectId_idx" ON "BillingSchedule"("tenantId", "projectId");
-- CreateIndex
CREATE INDEX "BillingSchedule_tenantId_nextBillDate_idx" ON "BillingSchedule"("tenantId", "nextBillDate");
-- CreateIndex
CREATE INDEX "BillingSchedule_tenantId_status_idx" ON "BillingSchedule"("tenantId", "status");
-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");
-- CreateIndex
CREATE INDEX "Customer_tenantId_code_idx" ON "Customer"("tenantId", "code");
-- CreateIndex
CREATE INDEX "CrmAccount_tenantId_status_idx" ON "CrmAccount"("tenantId", "status");
-- CreateIndex
CREATE INDEX "CrmAccount_tenantId_ownerId_idx" ON "CrmAccount"("tenantId", "ownerId");
-- CreateIndex
CREATE INDEX "CrmAccount_tenantId_type_idx" ON "CrmAccount"("tenantId", "type");
-- CreateIndex
CREATE UNIQUE INDEX "CrmAccount_tenantId_code_key" ON "CrmAccount"("tenantId", "code");
-- CreateIndex
CREATE INDEX "CrmContact_tenantId_accountId_idx" ON "CrmContact"("tenantId", "accountId");
-- CreateIndex
CREATE INDEX "CrmContact_tenantId_status_idx" ON "CrmContact"("tenantId", "status");
-- CreateIndex
CREATE INDEX "CrmContact_tenantId_ownerId_idx" ON "CrmContact"("tenantId", "ownerId");
-- CreateIndex
CREATE INDEX "CrmActivity_tenantId_contactId_idx" ON "CrmActivity"("tenantId", "contactId");
-- CreateIndex
CREATE INDEX "CrmActivity_tenantId_accountId_idx" ON "CrmActivity"("tenantId", "accountId");
-- CreateIndex
CREATE INDEX "CrmActivity_tenantId_opportunityId_idx" ON "CrmActivity"("tenantId", "opportunityId");
-- CreateIndex
CREATE INDEX "CrmActivity_tenantId_type_status_idx" ON "CrmActivity"("tenantId", "type", "status");
-- CreateIndex
CREATE INDEX "CrmActivity_tenantId_assignedTo_idx" ON "CrmActivity"("tenantId", "assignedTo");
-- CreateIndex
CREATE INDEX "CrmOpportunity_tenantId_accountId_stage_idx" ON "CrmOpportunity"("tenantId", "accountId", "stage");
-- CreateIndex
CREATE INDEX "CrmOpportunity_tenantId_stage_status_idx" ON "CrmOpportunity"("tenantId", "stage", "status");
-- CreateIndex
CREATE INDEX "CrmOpportunity_tenantId_ownerId_idx" ON "CrmOpportunity"("tenantId", "ownerId");
-- CreateIndex
CREATE INDEX "CrmOpportunity_tenantId_expectedCloseDate_idx" ON "CrmOpportunity"("tenantId", "expectedCloseDate");
-- CreateIndex
CREATE INDEX "OpportunityStageHistory_opportunityId_changedAt_idx" ON "OpportunityStageHistory"("opportunityId", "changedAt");
-- CreateIndex
CREATE UNIQUE INDEX "SalesQuote_number_key" ON "SalesQuote"("number");
-- CreateIndex
CREATE INDEX "SalesQuote_tenantId_customerId_idx" ON "SalesQuote"("tenantId", "customerId");
-- CreateIndex
CREATE INDEX "SalesQuote_tenantId_opportunityId_idx" ON "SalesQuote"("tenantId", "opportunityId");
-- CreateIndex
CREATE INDEX "SalesQuote_tenantId_status_idx" ON "SalesQuote"("tenantId", "status");
-- CreateIndex
CREATE INDEX "SalesQuoteLine_quoteId_idx" ON "SalesQuoteLine"("quoteId");
-- CreateIndex
CREATE UNIQUE INDEX "SalesQuoteLine_quoteId_lineNo_key" ON "SalesQuoteLine"("quoteId", "lineNo");
-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_number_key" ON "SalesOrder"("number");
-- CreateIndex
CREATE INDEX "SalesOrder_tenantId_customerId_idx" ON "SalesOrder"("tenantId", "customerId");
-- CreateIndex
CREATE INDEX "SalesOrder_tenantId_quoteId_idx" ON "SalesOrder"("tenantId", "quoteId");
-- CreateIndex
CREATE INDEX "SalesOrderLine_orderId_idx" ON "SalesOrderLine"("orderId");
-- CreateIndex
CREATE UNIQUE INDEX "SalesOrderLine_orderId_lineNo_key" ON "SalesOrderLine"("orderId", "lineNo");
-- CreateIndex
CREATE INDEX "Reservation_tenantId_orderId_idx" ON "Reservation"("tenantId", "orderId");
-- CreateIndex
CREATE INDEX "Reservation_tenantId_sku_idx" ON "Reservation"("tenantId", "sku");
-- CreateIndex
CREATE INDEX "PosSession_tenantId_storeId_shiftId_idx" ON "PosSession"("tenantId", "storeId", "shiftId");
-- CreateIndex
CREATE UNIQUE INDEX "PosDrawer_tenantId_storeId_code_key" ON "PosDrawer"("tenantId", "storeId", "code");
-- CreateIndex
CREATE UNIQUE INDEX "PosPromotion_code_key" ON "PosPromotion"("code");
-- CreateIndex
CREATE INDEX "PosPromotion_tenantId_effectiveFrom_effectiveTo_idx" ON "PosPromotion"("tenantId", "effectiveFrom", "effectiveTo");
-- CreateIndex
CREATE INDEX "PosVariance_tenantId_sessionId_idx" ON "PosVariance"("tenantId", "sessionId");
-- CreateIndex
CREATE INDEX "PosVariance_tenantId_shiftId_idx" ON "PosVariance"("tenantId", "shiftId");
-- CreateIndex
CREATE INDEX "CashMovement_tenantId_sessionId_idx" ON "CashMovement"("tenantId", "sessionId");
-- CreateIndex
CREATE INDEX "CashMovement_tenantId_createdAt_idx" ON "CashMovement"("tenantId", "createdAt");
-- CreateIndex
CREATE UNIQUE INDEX "ZReport_reportNumber_key" ON "ZReport"("reportNumber");
-- CreateIndex
CREATE INDEX "ZReport_tenantId_sessionId_idx" ON "ZReport"("tenantId", "sessionId");
-- CreateIndex
CREATE INDEX "ZReport_tenantId_generatedAt_idx" ON "ZReport"("tenantId", "generatedAt");
-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_code_key" ON "TaxCode"("code");
-- CreateIndex
CREATE INDEX "TaxCode_tenantId_code_idx" ON "TaxCode"("tenantId", "code");
-- CreateIndex
CREATE INDEX "TaxRate_taxCodeId_effectiveFrom_idx" ON "TaxRate"("taxCodeId", "effectiveFrom");
-- CreateIndex
CREATE UNIQUE INDEX "TaxGroup_code_key" ON "TaxGroup"("code");
-- CreateIndex
CREATE INDEX "TaxGroup_tenantId_code_idx" ON "TaxGroup"("tenantId", "code");
-- CreateIndex
CREATE INDEX "TaxRule_taxGroupId_jurisdiction_idx" ON "TaxRule"("taxGroupId", "jurisdiction");
-- CreateIndex
CREATE INDEX "TaxRule_taxGroupId_productCode_idx" ON "TaxRule"("taxGroupId", "productCode");
-- CreateIndex
CREATE INDEX "TaxRule_taxGroupId_customerCode_idx" ON "TaxRule"("taxGroupId", "customerCode");
-- CreateIndex
CREATE INDEX "TaxRule_taxGroupId_effectiveFrom_effectiveTo_idx" ON "TaxRule"("taxGroupId", "effectiveFrom", "effectiveTo");
-- CreateIndex
CREATE UNIQUE INDEX "TaxJurisdiction_code_key" ON "TaxJurisdiction"("code");
-- CreateIndex
CREATE INDEX "TaxJurisdiction_tenantId_code_idx" ON "TaxJurisdiction"("tenantId", "code");
-- CreateIndex
CREATE INDEX "TaxJurisdiction_tenantId_country_idx" ON "TaxJurisdiction"("tenantId", "country");
-- CreateIndex
CREATE INDEX "HmrcMtdSubmission_tenantId_vatReturnId_idx" ON "HmrcMtdSubmission"("tenantId", "vatReturnId");
-- CreateIndex
CREATE INDEX "GccEinvoicePayload_tenantId_invoiceId_idx" ON "GccEinvoicePayload"("tenantId", "invoiceId");
-- CreateIndex
CREATE INDEX "MetricPoint_tenantId_name_timestamp_idx" ON "MetricPoint"("tenantId", "name", "timestamp");
-- CreateIndex
CREATE INDEX "MetricsSnapshot_tenantId_module_snapshotAt_idx" ON "MetricsSnapshot"("tenantId", "module", "snapshotAt");
-- CreateIndex
CREATE UNIQUE INDEX "Partner_code_key" ON "Partner"("code");
-- CreateIndex
CREATE INDEX "Partner_code_idx" ON "Partner"("code");
-- CreateIndex
CREATE INDEX "PartnerTenant_tenantId_idx" ON "PartnerTenant"("tenantId");
-- CreateIndex
CREATE UNIQUE INDEX "PartnerTenant_partnerId_tenantId_key" ON "PartnerTenant"("partnerId", "tenantId");
-- CreateIndex
CREATE INDEX "PartnerRevenueShare_partnerId_effectiveFrom_idx" ON "PartnerRevenueShare"("partnerId", "effectiveFrom");
-- CreateIndex
CREATE UNIQUE INDEX "TenantConfig_tenantId_key" ON "TenantConfig"("tenantId");
-- CreateIndex
CREATE INDEX "TenantConfig_tenantId_idx" ON "TenantConfig"("tenantId");
-- CreateIndex
CREATE UNIQUE INDEX "Practice_code_key" ON "Practice"("code");
-- CreateIndex
CREATE INDEX "Practice_tenantId_code_idx" ON "Practice"("tenantId", "code");
-- CreateIndex
CREATE UNIQUE INDEX "Pcn_code_key" ON "Pcn"("code");
-- CreateIndex
CREATE INDEX "Pcn_tenantId_code_idx" ON "Pcn"("tenantId", "code");
-- CreateIndex
CREATE UNIQUE INDEX "PracticePcn_practiceId_pcnId_key" ON "PracticePcn"("practiceId", "pcnId");
-- CreateIndex
CREATE INDEX "HealthcareRotaHeader_tenantId_practiceId_weekStart_idx" ON "HealthcareRotaHeader"("tenantId", "practiceId", "weekStart");
-- CreateIndex
CREATE INDEX "HealthcareRotaShift_headerId_date_idx" ON "HealthcareRotaShift"("headerId", "date");
-- CreateIndex
CREATE INDEX "HealthcareRotaAssignment_shiftId_employeeId_idx" ON "HealthcareRotaAssignment"("shiftId", "employeeId");
-- CreateIndex
CREATE UNIQUE INDEX "ArrsRole_code_key" ON "ArrsRole"("code");
-- CreateIndex
CREATE INDEX "ArrsRole_tenantId_code_idx" ON "ArrsRole"("tenantId", "code");
-- CreateIndex
CREATE INDEX "ArrsAssignment_tenantId_employeeId_roleId_idx" ON "ArrsAssignment"("tenantId", "employeeId", "roleId");
-- CreateIndex
CREATE INDEX "LocumAssignment_tenantId_employeeId_practiceId_idx" ON "LocumAssignment"("tenantId", "employeeId", "practiceId");
-- CreateIndex
CREATE INDEX "HealthcareClaim_tenantId_practiceId_periodStart_periodEnd_idx" ON "HealthcareClaim"("tenantId", "practiceId", "periodStart", "periodEnd");
-- CreateIndex
CREATE INDEX "ArrsClaim_tenantId_pcnId_periodStart_periodEnd_idx" ON "ArrsClaim"("tenantId", "pcnId", "periodStart", "periodEnd");
-- CreateIndex
CREATE INDEX "Attachment_tenantId_entityType_entityId_idx" ON "Attachment"("tenantId", "entityType", "entityId");
-- CreateIndex
CREATE INDEX "Attachment_tenantId_status_idx" ON "Attachment"("tenantId", "status");
-- CreateIndex
CREATE UNIQUE INDEX "ImportJob_undoToken_key" ON "ImportJob"("undoToken");
-- CreateIndex
CREATE INDEX "ImportJob_tenantId_type_status_idx" ON "ImportJob"("tenantId", "type", "status");
-- CreateIndex
CREATE INDEX "ImportJobItem_jobId_rowNumber_idx" ON "ImportJobItem"("jobId", "rowNumber");
-- CreateIndex
CREATE UNIQUE INDEX "PriceList_code_key" ON "PriceList"("code");
-- CreateIndex
CREATE INDEX "PriceList_tenantId_code_idx" ON "PriceList"("tenantId", "code");
-- CreateIndex
CREATE INDEX "PriceListItem_priceListId_idx" ON "PriceListItem"("priceListId");
-- CreateIndex
CREATE UNIQUE INDEX "PriceListItem_priceListId_sku_key" ON "PriceListItem"("priceListId", "sku");
-- CreateIndex
CREATE INDEX "OutboxEvent_tenantId_status_nextAttemptAt_idx" ON "OutboxEvent"("tenantId", "status", "nextAttemptAt");
-- CreateIndex
CREATE INDEX "OutboxEvent_tenantId_type_idx" ON "OutboxEvent"("tenantId", "type");
-- CreateIndex
CREATE INDEX "EventSubscription_tenantId_topic_enabled_idx" ON "EventSubscription"("tenantId", "topic", "enabled");
-- CreateIndex
CREATE INDEX "TenantKey_tenantId_version_idx" ON "TenantKey"("tenantId", "version");
-- CreateIndex
CREATE INDEX "BackupPolicy_tenantId_idx" ON "BackupPolicy"("tenantId");
-- CreateIndex
CREATE INDEX "BackupRun_tenantId_policyId_startedAt_idx" ON "BackupRun"("tenantId", "policyId", "startedAt");
-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_code_key" ON "WorkflowDefinition"("code");
-- CreateIndex
CREATE INDEX "WorkflowDefinition_tenantId_entityType_active_idx" ON "WorkflowDefinition"("tenantId", "entityType", "active");
-- CreateIndex
CREATE INDEX "WorkflowInstance_tenantId_entityType_entityId_idx" ON "WorkflowInstance"("tenantId", "entityType", "entityId");
-- CreateIndex
CREATE INDEX "WorkflowInstance_tenantId_definitionId_status_idx" ON "WorkflowInstance"("tenantId", "definitionId", "status");
-- CreateIndex
CREATE INDEX "WorkflowHistory_instanceId_createdAt_idx" ON "WorkflowHistory"("instanceId", "createdAt");
-- CreateIndex
CREATE INDEX "CustomFieldDefinition_tenantId_entityType_active_idx" ON "CustomFieldDefinition"("tenantId", "entityType", "active");
-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldDefinition_tenantId_entityType_code_key" ON "CustomFieldDefinition"("tenantId", "entityType", "code");
-- CreateIndex
CREATE INDEX "CustomFieldValue_tenantId_entityType_entityId_idx" ON "CustomFieldValue"("tenantId", "entityType", "entityId");
-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldValue_tenantId_definitionId_entityType_entityId_key" ON "CustomFieldValue"("tenantId", "definitionId", "entityType", "entityId");
-- CreateIndex
CREATE INDEX "SafetyStock_tenantId_sku_idx" ON "SafetyStock"("tenantId", "sku");
-- CreateIndex
CREATE UNIQUE INDEX "SafetyStock_tenantId_sku_warehouseId_key" ON "SafetyStock"("tenantId", "sku", "warehouseId");
-- CreateIndex
CREATE INDEX "PlanningSnapshot_tenantId_snapshotAt_idx" ON "PlanningSnapshot"("tenantId", "snapshotAt");
-- CreateIndex
CREATE INDEX "PlanRecommendation_tenantId_type_status_idx" ON "PlanRecommendation"("tenantId", "type", "status");
-- CreateIndex
CREATE INDEX "Department_tenantId_idx" ON "Department"("tenantId");
-- CreateIndex
CREATE UNIQUE INDEX "Department_tenantId_code_key" ON "Department"("tenantId", "code");
-- CreateIndex
CREATE INDEX "Team_tenantId_departmentId_idx" ON "Team"("tenantId", "departmentId");
-- CreateIndex
CREATE UNIQUE INDEX "Team_tenantId_code_key" ON "Team"("tenantId", "code");
-- CreateIndex
CREATE INDEX "UserDepartment_userId_idx" ON "UserDepartment"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "UserDepartment_userId_departmentId_key" ON "UserDepartment"("userId", "departmentId");
-- CreateIndex
CREATE INDEX "UserTeam_userId_idx" ON "UserTeam"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "UserTeam_userId_teamId_key" ON "UserTeam"("userId", "teamId");
-- CreateIndex
CREATE INDEX "AgentRun_tenantId_userId_status_idx" ON "AgentRun"("tenantId", "userId", "status");
-- CreateIndex
CREATE INDEX "AgentRun_tenantId_module_idx" ON "AgentRun"("tenantId", "module");
-- CreateIndex
CREATE INDEX "AgentStep_runId_startedAt_idx" ON "AgentStep"("runId", "startedAt");
-- CreateIndex
CREATE INDEX "AgentConfig_tenantId_enabled_idx" ON "AgentConfig"("tenantId", "enabled");
-- CreateIndex
CREATE UNIQUE INDEX "AgentConfig_tenantId_module_key" ON "AgentConfig"("tenantId", "module");
-- CreateIndex
CREATE UNIQUE INDEX "DimDate_date_key" ON "DimDate"("date");
-- CreateIndex
CREATE INDEX "DimDate_year_month_idx" ON "DimDate"("year", "month");
-- CreateIndex
CREATE INDEX "DimDate_year_quarter_idx" ON "DimDate"("year", "quarter");
-- CreateIndex
CREATE UNIQUE INDEX "DimTenant_tenantId_key" ON "DimTenant"("tenantId");
-- CreateIndex
CREATE INDEX "DimTenant_region_idx" ON "DimTenant"("region");
-- CreateIndex
CREATE INDEX "DimTenant_industry_idx" ON "DimTenant"("industry");
-- CreateIndex
CREATE INDEX "DimCustomer_tenantId_type_idx" ON "DimCustomer"("tenantId", "type");
-- CreateIndex
CREATE INDEX "DimCustomer_tenantId_industry_idx" ON "DimCustomer"("tenantId", "industry");
-- CreateIndex
CREATE UNIQUE INDEX "DimCustomer_tenantId_customerId_key" ON "DimCustomer"("tenantId", "customerId");
-- CreateIndex
CREATE INDEX "DimProduct_tenantId_category_idx" ON "DimProduct"("tenantId", "category");
-- CreateIndex
CREATE UNIQUE INDEX "DimProduct_tenantId_sku_key" ON "DimProduct"("tenantId", "sku");
-- CreateIndex
CREATE INDEX "DimLocation_tenantId_warehouseCode_idx" ON "DimLocation"("tenantId", "warehouseCode");
-- CreateIndex
CREATE UNIQUE INDEX "DimLocation_tenantId_warehouseId_locationId_key" ON "DimLocation"("tenantId", "warehouseId", "locationId");
-- CreateIndex
CREATE INDEX "DimProject_tenantId_customerId_idx" ON "DimProject"("tenantId", "customerId");
-- CreateIndex
CREATE INDEX "DimProject_tenantId_status_idx" ON "DimProject"("tenantId", "status");
-- CreateIndex
CREATE UNIQUE INDEX "DimProject_tenantId_projectId_key" ON "DimProject"("tenantId", "projectId");
-- CreateIndex
CREATE INDEX "DimChannel_tenantId_type_idx" ON "DimChannel"("tenantId", "type");
-- CreateIndex
CREATE UNIQUE INDEX "DimChannel_tenantId_channelId_key" ON "DimChannel"("tenantId", "channelId");
-- CreateIndex
CREATE INDEX "FactInvoice_tenantId_dateId_idx" ON "FactInvoice"("tenantId", "dateId");
-- CreateIndex
CREATE INDEX "FactInvoice_tenantId_customerDimId_idx" ON "FactInvoice"("tenantId", "customerDimId");
-- CreateIndex
CREATE INDEX "FactInvoice_tenantId_invoiceId_idx" ON "FactInvoice"("tenantId", "invoiceId");
-- CreateIndex
CREATE INDEX "FactInvoice_tenantId_createdAt_idx" ON "FactInvoice"("tenantId", "createdAt");
-- CreateIndex
CREATE INDEX "FactOrder_tenantId_dateId_idx" ON "FactOrder"("tenantId", "dateId");
-- CreateIndex
CREATE INDEX "FactOrder_tenantId_customerDimId_idx" ON "FactOrder"("tenantId", "customerDimId");
-- CreateIndex
CREATE INDEX "FactOrder_tenantId_orderId_idx" ON "FactOrder"("tenantId", "orderId");
-- CreateIndex
CREATE INDEX "FactReceipt_tenantId_dateId_idx" ON "FactReceipt"("tenantId", "dateId");
-- CreateIndex
CREATE INDEX "FactReceipt_tenantId_channelDimId_idx" ON "FactReceipt"("tenantId", "channelDimId");
-- CreateIndex
CREATE INDEX "FactReceipt_tenantId_receiptId_idx" ON "FactReceipt"("tenantId", "receiptId");
-- CreateIndex
CREATE INDEX "FactProjectWip_tenantId_dateId_idx" ON "FactProjectWip"("tenantId", "dateId");
-- CreateIndex
CREATE INDEX "FactProjectWip_tenantId_projectDimId_idx" ON "FactProjectWip"("tenantId", "projectDimId");
-- CreateIndex
CREATE INDEX "FactProjectWip_tenantId_billed_idx" ON "FactProjectWip"("tenantId", "billed");
-- CreateIndex
CREATE INDEX "FactInventoryMovement_tenantId_dateId_idx" ON "FactInventoryMovement"("tenantId", "dateId");
-- CreateIndex
CREATE INDEX "FactInventoryMovement_tenantId_productDimId_idx" ON "FactInventoryMovement"("tenantId", "productDimId");
-- CreateIndex
CREATE INDEX "FactInventoryMovement_tenantId_locationDimId_idx" ON "FactInventoryMovement"("tenantId", "locationDimId");
-- CreateIndex
CREATE INDEX "FactInventoryMovement_tenantId_type_idx" ON "FactInventoryMovement"("tenantId", "type");
-- CreateIndex
CREATE INDEX "FactWorkOrder_tenantId_dateId_idx" ON "FactWorkOrder"("tenantId", "dateId");
-- CreateIndex
CREATE INDEX "FactWorkOrder_tenantId_productDimId_idx" ON "FactWorkOrder"("tenantId", "productDimId");
-- CreateIndex
CREATE INDEX "FactWorkOrder_tenantId_workOrderId_idx" ON "FactWorkOrder"("tenantId", "workOrderId");
-- CreateIndex
CREATE INDEX "FactWorkOrder_tenantId_status_idx" ON "FactWorkOrder"("tenantId", "status");
-- CreateIndex
CREATE INDEX "Allowance_tenantId_idx" ON "Allowance"("tenantId");
-- CreateIndex
CREATE INDEX "ConsolidationMap_tenantId_idx" ON "ConsolidationMap"("tenantId");
-- CreateIndex
CREATE INDEX "Deduction_tenantId_idx" ON "Deduction"("tenantId");
-- CreateIndex
CREATE INDEX "EntityExt_tenantId_idx" ON "EntityExt"("tenantId");
-- CreateIndex
CREATE INDEX "IntercompanyTxn_tenantId_idx" ON "IntercompanyTxn"("tenantId");
-- CreateIndex
CREATE INDEX "JournalLine_tenantId_idx" ON "JournalLine"("tenantId");
-- CreateIndex
CREATE INDEX "PoLine_tenantId_idx" ON "PoLine"("tenantId");
-- CreateIndex
CREATE INDEX "PosSale_tenantId_sessionId_idx" ON "PosSale"("tenantId", "sessionId");
-- CreateIndex
CREATE INDEX "PosSale_tenantId_customerId_idx" ON "PosSale"("tenantId", "customerId");
-- CreateIndex
CREATE INDEX "RoutingStep_tenantId_idx" ON "RoutingStep"("tenantId");
-- CreateIndex
CREATE INDEX "VatReturn_tenantId_vrn_periodKey_idx" ON "VatReturn"("tenantId", "vrn", "periodKey");
-- CreateIndex
CREATE INDEX "WebhookEvent_tenantId_idx" ON "WebhookEvent"("tenantId");
-- AddForeignKey
ALTER TABLE "WorkOrderMaterialIssue" ADD CONSTRAINT "WorkOrderMaterialIssue_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "WorkOrderMaterialIssue" ADD CONSTRAINT "WorkOrderMaterialIssue_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ScrapRecord" ADD CONSTRAINT "ScrapRecord_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "VarianceReport" ADD CONSTRAINT "VarianceReport_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CycleCountPlan" ADD CONSTRAINT "CycleCountPlan_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CycleCountLine" ADD CONSTRAINT "CycleCountLine_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CycleCountPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CycleCountLine" ADD CONSTRAINT "CycleCountLine_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ShipmentLine" ADD CONSTRAINT "ShipmentLine_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PutawayTask" ADD CONSTRAINT "PutawayTask_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PutawayTask" ADD CONSTRAINT "PutawayTask_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CustomerInvoice" ADD CONSTRAINT "CustomerInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PosSale" ADD CONSTRAINT "PosSale_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PosSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PosSale" ADD CONSTRAINT "PosSale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "BlanketPOLine" ADD CONSTRAINT "BlanketPOLine_blanketPoId_fkey" FOREIGN KEY ("blanketPoId") REFERENCES "BlanketPO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "BlanketPORelease" ADD CONSTRAINT "BlanketPORelease_blanketPoId_fkey" FOREIGN KEY ("blanketPoId") REFERENCES "BlanketPO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SupplierContractTier" ADD CONSTRAINT "SupplierContractTier_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "SupplierContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ProjectPhase" ADD CONSTRAINT "ProjectPhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProjectPhase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProjectPhase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ProjectRetainer" ADD CONSTRAINT "ProjectRetainer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ProjectInvoiceLine" ADD CONSTRAINT "ProjectInvoiceLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ProjectInvoiceLine" ADD CONSTRAINT "ProjectInvoiceLine_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProjectPhase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "WipLedger" ADD CONSTRAINT "WipLedger_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "WipLedger" ADD CONSTRAINT "WipLedger_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProjectPhase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "BillingSchedule" ADD CONSTRAINT "BillingSchedule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "BillingSchedule" ADD CONSTRAINT "BillingSchedule_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProjectPhase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CrmContact" ADD CONSTRAINT "CrmContact_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "OpportunityStageHistory" ADD CONSTRAINT "OpportunityStageHistory_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "CrmOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SalesQuoteLine" ADD CONSTRAINT "SalesQuoteLine_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "SalesQuote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "SalesQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SalesOrderLine" ADD CONSTRAINT "SalesOrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "SalesOrderLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "TillShift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PosDrawer" ADD CONSTRAINT "PosDrawer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PosVariance" ADD CONSTRAINT "PosVariance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PosSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PosVariance" ADD CONSTRAINT "PosVariance_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "TillShift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PosSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ZReport" ADD CONSTRAINT "ZReport_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PosSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_taxGroupId_fkey" FOREIGN KEY ("taxGroupId") REFERENCES "TaxGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "HmrcMtdSubmission" ADD CONSTRAINT "HmrcMtdSubmission_vatReturnId_fkey" FOREIGN KEY ("vatReturnId") REFERENCES "VatReturn"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PartnerTenant" ADD CONSTRAINT "PartnerTenant_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PartnerRevenueShare" ADD CONSTRAINT "PartnerRevenueShare_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PracticePcn" ADD CONSTRAINT "PracticePcn_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PracticePcn" ADD CONSTRAINT "PracticePcn_pcnId_fkey" FOREIGN KEY ("pcnId") REFERENCES "Pcn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "HealthcareRotaHeader" ADD CONSTRAINT "HealthcareRotaHeader_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "HealthcareRotaShift" ADD CONSTRAINT "HealthcareRotaShift_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "HealthcareRotaHeader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "HealthcareRotaAssignment" ADD CONSTRAINT "HealthcareRotaAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "HealthcareRotaShift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ArrsAssignment" ADD CONSTRAINT "ArrsAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ArrsRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "LocumAssignment" ADD CONSTRAINT "LocumAssignment_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "HealthcareClaim" ADD CONSTRAINT "HealthcareClaim_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ArrsClaim" ADD CONSTRAINT "ArrsClaim_pcnId_fkey" FOREIGN KEY ("pcnId") REFERENCES "Pcn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ArrsClaim" ADD CONSTRAINT "ArrsClaim_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ImportJobItem" ADD CONSTRAINT "ImportJobItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ImportJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "BackupRun" ADD CONSTRAINT "BackupRun_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "BackupPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "WorkflowHistory" ADD CONSTRAINT "WorkflowHistory_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "WorkflowInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CustomFieldValue" ADD CONSTRAINT "CustomFieldValue_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "CustomFieldDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "UserDepartment" ADD CONSTRAINT "UserDepartment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "UserDepartment" ADD CONSTRAINT "UserDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "AgentStep" ADD CONSTRAINT "AgentStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactInvoice" ADD CONSTRAINT "FactInvoice_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DimDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactInvoice" ADD CONSTRAINT "FactInvoice_tenantDimId_fkey" FOREIGN KEY ("tenantDimId") REFERENCES "DimTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactInvoice" ADD CONSTRAINT "FactInvoice_customerDimId_fkey" FOREIGN KEY ("customerDimId") REFERENCES "DimCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactOrder" ADD CONSTRAINT "FactOrder_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DimDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactOrder" ADD CONSTRAINT "FactOrder_tenantDimId_fkey" FOREIGN KEY ("tenantDimId") REFERENCES "DimTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactOrder" ADD CONSTRAINT "FactOrder_customerDimId_fkey" FOREIGN KEY ("customerDimId") REFERENCES "DimCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactReceipt" ADD CONSTRAINT "FactReceipt_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DimDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactReceipt" ADD CONSTRAINT "FactReceipt_tenantDimId_fkey" FOREIGN KEY ("tenantDimId") REFERENCES "DimTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactReceipt" ADD CONSTRAINT "FactReceipt_customerDimId_fkey" FOREIGN KEY ("customerDimId") REFERENCES "DimCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactReceipt" ADD CONSTRAINT "FactReceipt_channelDimId_fkey" FOREIGN KEY ("channelDimId") REFERENCES "DimChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactProjectWip" ADD CONSTRAINT "FactProjectWip_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DimDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactProjectWip" ADD CONSTRAINT "FactProjectWip_tenantDimId_fkey" FOREIGN KEY ("tenantDimId") REFERENCES "DimTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactProjectWip" ADD CONSTRAINT "FactProjectWip_projectDimId_fkey" FOREIGN KEY ("projectDimId") REFERENCES "DimProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactProjectWip" ADD CONSTRAINT "FactProjectWip_customerDimId_fkey" FOREIGN KEY ("customerDimId") REFERENCES "DimCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactInventoryMovement" ADD CONSTRAINT "FactInventoryMovement_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DimDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactInventoryMovement" ADD CONSTRAINT "FactInventoryMovement_tenantDimId_fkey" FOREIGN KEY ("tenantDimId") REFERENCES "DimTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactInventoryMovement" ADD CONSTRAINT "FactInventoryMovement_productDimId_fkey" FOREIGN KEY ("productDimId") REFERENCES "DimProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactInventoryMovement" ADD CONSTRAINT "FactInventoryMovement_locationDimId_fkey" FOREIGN KEY ("locationDimId") REFERENCES "DimLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactWorkOrder" ADD CONSTRAINT "FactWorkOrder_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "DimDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactWorkOrder" ADD CONSTRAINT "FactWorkOrder_tenantDimId_fkey" FOREIGN KEY ("tenantDimId") REFERENCES "DimTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "FactWorkOrder" ADD CONSTRAINT "FactWorkOrder_productDimId_fkey" FOREIGN KEY ("productDimId") REFERENCES "DimProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;