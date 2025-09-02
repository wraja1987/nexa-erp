-- CreateEnum
CREATE TYPE "public"."WorkOrderStatus" AS ENUM ('planned', 'released', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('pending', 'in_progress', 'done', 'blocked');

-- CreateTable
CREATE TABLE "public"."WorkOrder" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "status" "public"."WorkOrderStatus" NOT NULL DEFAULT 'planned',
    "startPlanned" TIMESTAMP(3),
    "endPlanned" TIMESTAMP(3),
    "startActual" TIMESTAMP(3),
    "endActual" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BomItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "parentItemCode" TEXT NOT NULL,
    "componentItemCode" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BomItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoutingStep" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT,
    "seq" INTEGER NOT NULL,
    "resourceCode" TEXT,
    "durationMins" INTEGER,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MrpPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "planDate" TIMESTAMP(3) NOT NULL,
    "suggestedQty" DECIMAL(65,30) NOT NULL,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MrpPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CapacityCalendar" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "resourceCode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "availableMins" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapacityCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_number_key" ON "public"."WorkOrder"("number");

-- CreateIndex
CREATE INDEX "WorkOrder_tenantId_idx" ON "public"."WorkOrder"("tenantId");

-- CreateIndex
CREATE INDEX "WorkOrder_itemCode_idx" ON "public"."WorkOrder"("itemCode");

-- CreateIndex
CREATE INDEX "BomItem_tenantId_idx" ON "public"."BomItem"("tenantId");

-- CreateIndex
CREATE INDEX "BomItem_parentItemCode_idx" ON "public"."BomItem"("parentItemCode");

-- CreateIndex
CREATE INDEX "RoutingStep_workOrderId_idx" ON "public"."RoutingStep"("workOrderId");

-- CreateIndex
CREATE INDEX "MrpPlan_tenantId_itemCode_idx" ON "public"."MrpPlan"("tenantId", "itemCode");

-- CreateIndex
CREATE INDEX "CapacityCalendar_tenantId_resourceCode_date_idx" ON "public"."CapacityCalendar"("tenantId", "resourceCode", "date");

-- AddForeignKey
ALTER TABLE "public"."RoutingStep" ADD CONSTRAINT "RoutingStep_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "public"."WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
