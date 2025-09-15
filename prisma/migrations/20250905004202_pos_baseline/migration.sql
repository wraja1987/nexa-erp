-- CreateEnum
CREATE TYPE "public"."TillShiftStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "public"."PosSaleStatus" AS ENUM ('open', 'paid', 'refunded', 'void');

-- CreateEnum
CREATE TYPE "public"."PosPaymentMethod" AS ENUM ('card', 'cash');

-- CreateTable
CREATE TABLE "public"."Store" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/London',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TillShift" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "openedByUserId" TEXT NOT NULL,
    "closedByUserId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "openingFloat" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "closingFloat" DECIMAL(65,30),
    "status" "public"."TillShiftStatus" NOT NULL DEFAULT 'open',

    CONSTRAINT "TillShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PosSale" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "shiftId" TEXT,
    "cashierUserId" TEXT NOT NULL,
    "saleNumber" TEXT NOT NULL,
    "status" "public"."PosSaleStatus" NOT NULL DEFAULT 'open',
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PosLine" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(65,30) NOT NULL,
    "inventoryItemId" TEXT,

    CONSTRAINT "PosLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PosPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "method" "public"."PosPaymentMethod" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "tip" DECIMAL(65,30),
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PosRefund" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reason" TEXT,
    "stripeRefundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PosEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "saleId" TEXT,
    "shiftId" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Store_tenantId_idx" ON "public"."Store"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_tenantId_code_key" ON "public"."Store"("tenantId", "code");

-- CreateIndex
CREATE INDEX "TillShift_tenantId_storeId_openedAt_idx" ON "public"."TillShift"("tenantId", "storeId", "openedAt");

-- CreateIndex
CREATE INDEX "PosSale_tenantId_storeId_createdAt_idx" ON "public"."PosSale"("tenantId", "storeId", "createdAt");

-- CreateIndex
CREATE INDEX "PosSale_tenantId_shiftId_idx" ON "public"."PosSale"("tenantId", "shiftId");

-- CreateIndex
CREATE UNIQUE INDEX "PosSale_tenantId_saleNumber_key" ON "public"."PosSale"("tenantId", "saleNumber");

-- CreateIndex
CREATE INDEX "PosLine_tenantId_saleId_idx" ON "public"."PosLine"("tenantId", "saleId");

-- CreateIndex
CREATE INDEX "PosPayment_tenantId_saleId_idx" ON "public"."PosPayment"("tenantId", "saleId");

-- CreateIndex
CREATE INDEX "PosPayment_tenantId_stripePaymentIntentId_idx" ON "public"."PosPayment"("tenantId", "stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "PosRefund_tenantId_saleId_idx" ON "public"."PosRefund"("tenantId", "saleId");

-- CreateIndex
CREATE INDEX "PosRefund_tenantId_stripeRefundId_idx" ON "public"."PosRefund"("tenantId", "stripeRefundId");

-- CreateIndex
CREATE INDEX "PosEvent_tenantId_saleId_createdAt_idx" ON "public"."PosEvent"("tenantId", "saleId", "createdAt");

-- CreateIndex
CREATE INDEX "PosEvent_tenantId_shiftId_createdAt_idx" ON "public"."PosEvent"("tenantId", "shiftId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."TillShift" ADD CONSTRAINT "TillShift_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PosSale" ADD CONSTRAINT "PosSale_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PosSale" ADD CONSTRAINT "PosSale_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."TillShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PosLine" ADD CONSTRAINT "PosLine_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."PosSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PosPayment" ADD CONSTRAINT "PosPayment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."PosSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PosRefund" ADD CONSTRAINT "PosRefund_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."PosSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PosEvent" ADD CONSTRAINT "PosEvent_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."PosSale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PosEvent" ADD CONSTRAINT "PosEvent_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."TillShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
