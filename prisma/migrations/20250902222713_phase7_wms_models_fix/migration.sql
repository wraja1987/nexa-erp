-- CreateEnum
CREATE TYPE "public"."AsnStatus" AS ENUM ('created', 'received', 'closed');

-- CreateEnum
CREATE TYPE "public"."WaveStatus" AS ENUM ('planned', 'released', 'dispatched');

-- CreateEnum
CREATE TYPE "public"."PickStatus" AS ENUM ('queued', 'picked', 'short', 'cancelled');

-- CreateTable
CREATE TABLE "public"."Warehouse" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qtyOnHand" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "supplierRef" TEXT,
    "status" "public"."AsnStatus" NOT NULL DEFAULT 'created',
    "eta" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wave" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "public"."WaveStatus" NOT NULL DEFAULT 'planned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PickTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "waveId" TEXT,
    "sku" TEXT NOT NULL,
    "qty" DECIMAL(65,30) NOT NULL,
    "fromLocId" TEXT,
    "toLocId" TEXT,
    "status" "public"."PickStatus" NOT NULL DEFAULT 'queued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ThirdPartyConnector" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdPartyConnector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_code_key" ON "public"."Warehouse"("code");

-- CreateIndex
CREATE INDEX "Warehouse_tenantId_idx" ON "public"."Warehouse"("tenantId");

-- CreateIndex
CREATE INDEX "Location_tenantId_idx" ON "public"."Location"("tenantId");

-- CreateIndex
CREATE INDEX "Location_warehouseId_code_idx" ON "public"."Location"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "InventoryItem_tenantId_sku_idx" ON "public"."InventoryItem"("tenantId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Asn_number_key" ON "public"."Asn"("number");

-- CreateIndex
CREATE INDEX "Asn_tenantId_idx" ON "public"."Asn"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Wave_number_key" ON "public"."Wave"("number");

-- CreateIndex
CREATE INDEX "Wave_tenantId_idx" ON "public"."Wave"("tenantId");

-- CreateIndex
CREATE INDEX "PickTask_tenantId_idx" ON "public"."PickTask"("tenantId");

-- CreateIndex
CREATE INDEX "ThirdPartyConnector_tenantId_provider_idx" ON "public"."ThirdPartyConnector"("tenantId", "provider");

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryItem" ADD CONSTRAINT "InventoryItem_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryItem" ADD CONSTRAINT "InventoryItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickTask" ADD CONSTRAINT "PickTask_waveId_fkey" FOREIGN KEY ("waveId") REFERENCES "public"."Wave"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickTask" ADD CONSTRAINT "PickTask_fromLocId_fkey" FOREIGN KEY ("fromLocId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickTask" ADD CONSTRAINT "PickTask_toLocId_fkey" FOREIGN KEY ("toLocId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
