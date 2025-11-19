/**
 * Phase 26 — Planning Engine (Pure Computation)
 *
 * Pure functions for planning calculations. No DB access, no side effects.
 */

import type {
  PlanningBucket,
  DemandSignal,
  SupplySignal,
  DemandPlan,
  SupplyPlan,
  NetRequirement,
  PlanRecommendation,
  PlanRecommendationType,
  CapacityView,
} from "./types";

/**
 * Generate time buckets for planning horizon
 */
export function generateBuckets(
  startDate: Date,
  horizonMonths: number,
  bucketSize: "week" | "month"
): PlanningBucket[] {
  const buckets: PlanningBucket[] = [];
  const current = new Date(startDate);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + horizonMonths);

  while (current < endDate) {
    const bucketStart = new Date(current);
    const bucketEnd = new Date(current);

    if (bucketSize === "week") {
      bucketEnd.setDate(bucketEnd.getDate() + 7);
      buckets.push({
        start: bucketStart.toISOString().split("T")[0],
        end: bucketEnd.toISOString().split("T")[0],
        label: `Week ${buckets.length + 1}`,
      });
      current.setDate(current.getDate() + 7);
    } else {
      // month
      bucketEnd.setMonth(bucketEnd.getMonth() + 1);
      buckets.push({
        start: bucketStart.toISOString().split("T")[0],
        end: bucketEnd.toISOString().split("T")[0],
        label: bucketStart.toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      });
      current.setMonth(current.getMonth() + 1);
    }
  }

  return buckets;
}

/**
 * Bucket demand signals by time bucket
 */
export function bucketDemand(
  signals: DemandSignal[],
  buckets: PlanningBucket[]
): DemandPlan[] {
  const plans: Map<string, DemandPlan> = new Map();

  for (const signal of signals) {
    // Find which bucket this signal belongs to
    const signalDate = new Date(signal.bucket.start);
    const bucket = buckets.find((b) => {
      const bucketStart = new Date(b.start);
      const bucketEnd = new Date(b.end);
      return signalDate >= bucketStart && signalDate < bucketEnd;
    });

    if (!bucket) continue;

    const key = `${signal.itemId}|${signal.warehouseId || ""}|${signal.locationId || ""}|${bucket.start}`;
    let plan = plans.get(key);

    if (!plan) {
      plan = {
        itemId: signal.itemId,
        warehouseId: signal.warehouseId,
        locationId: signal.locationId,
        bucket,
        totalDemand: 0,
        signals: [],
      };
      plans.set(key, plan);
    }

    plan.totalDemand += signal.quantityMinor;
    plan.signals.push(signal);
  }

  return Array.from(plans.values());
}

/**
 * Compute net requirements from demand and supply plans
 */
export function computeNetRequirements(
  demandPlans: DemandPlan[],
  supplySignals: SupplySignal[],
  safetyStockConfig?: Record<string, number> // itemId -> safety stock level
): NetRequirement[] {
  const requirements: NetRequirement[] = [];
  const supplyMap = new Map<string, SupplySignal>();

  // Index supply signals by item/warehouse/location/bucket
  for (const supply of supplySignals) {
    const key = `${supply.itemId}|${supply.warehouseId || ""}|${supply.locationId || ""}|${supply.bucket.start}`;
    supplyMap.set(key, supply);
  }

  for (const demandPlan of demandPlans) {
    const key = `${demandPlan.itemId}|${demandPlan.warehouseId || ""}|${demandPlan.locationId || ""}|${demandPlan.bucket.start}`;
    const supply = supplyMap.get(key);

    const demand = demandPlan.totalDemand;
    const supplyTotal = supply
      ? supply.onHand + supply.openPO + supply.openWO + (supply.transfersIn - supply.transfersOut)
      : 0;
    const safetyStock = supply?.safetyStock ?? safetyStockConfig?.[demandPlan.itemId] ?? 0;

    const netRequirement = Math.max(0, demand - supplyTotal + safetyStock); // Include safety stock buffer
    const projectedOnHand = supplyTotal - demand;

    requirements.push({
      itemId: demandPlan.itemId,
      warehouseId: demandPlan.warehouseId,
      locationId: demandPlan.locationId,
      bucket: demandPlan.bucket,
      demand,
      supply: supplyTotal,
      netRequirement,
      safetyStock,
      projectedOnHand,
    });
  }

  return requirements;
}

/**
 * Generate recommendations from net requirements
 */
export function generateRecommendations(
  netRequirements: NetRequirement[],
  tenantId: string,
  options?: {
    defaultLeadTimeDays?: number; // Default lead time for POs (default: 14)
    defaultProductionDays?: number; // Default production time for WOs (default: 7)
    preferManufacturing?: boolean; // Prefer WO over PO if item can be manufactured
    canManufacture?: (itemId: string) => boolean; // Check if item can be manufactured
  }
): PlanRecommendation[] {
  const recommendations: PlanRecommendation[] = [];
  const defaultLeadTimeDays = options?.defaultLeadTimeDays ?? 14;
  const defaultProductionDays = options?.defaultProductionDays ?? 7;

  for (const req of netRequirements) {
    if (req.netRequirement <= 0) continue; // No shortage

    const bucketStart = new Date(req.bucket.start);
    const dueDate = new Date(bucketStart);
    dueDate.setDate(dueDate.getDate() - defaultLeadTimeDays); // Order earlier to account for lead time

    // Determine recommendation type
    let type: PlanRecommendationType = "purchase_order";
    let confidence: PlanRecommendation["confidence"] = "medium";
    let reason = `Net requirement of ${req.netRequirement} units for ${req.bucket.label || req.bucket.start}`;

    if (options?.preferManufacturing && options?.canManufacture?.(req.itemId)) {
      type = "work_order";
      dueDate.setDate(dueDate.getDate() - defaultProductionDays);
      reason = `Manufacture ${req.netRequirement} units for ${req.bucket.label || req.bucket.start}`;
      confidence = "high";
    } else if (req.warehouseId) {
      // Check if transfer from another warehouse is possible (simplified logic)
      // In a real system, we'd check other warehouses for surplus
      // For now, default to PO
      type = "purchase_order";
      reason = `Purchase ${req.netRequirement} units for ${req.warehouseId || "warehouse"} by ${req.bucket.label || req.bucket.start}`;
      confidence = req.netRequirement > req.safetyStock ? "high" : "medium";
    }

    recommendations.push({
      id: `rec_${req.itemId}_${req.bucket.start}_${Date.now()}`,
      tenantId,
      type,
      itemId: req.itemId,
      warehouseId: req.warehouseId,
      quantityMinor: req.netRequirement,
      dueDate: dueDate.toISOString().split("T")[0],
      reason,
      confidence,
      bucket: req.bucket,
      metadata: {
        netRequirement: req.netRequirement,
        demand: req.demand,
        supply: req.supply,
        safetyStock: req.safetyStock,
      },
    });
  }

  return recommendations;
}

/**
 * Aggregate capacity data into capacity views
 */
export function aggregateCapacity(
  capacityData: Array<{
    resourceCode: string;
    bucket: PlanningBucket;
    availableMins: number;
    workOrders: Array<{
      workOrderId: string;
      itemCode: string;
      quantity: number;
      startDate: string;
      endDate: string;
      durationMins: number;
    }>;
  }>
): CapacityView[] {
  const views: CapacityView[] = [];

  for (const data of capacityData) {
    const allocatedMins = data.workOrders.reduce((sum, wo) => sum + wo.durationMins, 0);
    const utilizationPercent =
      data.availableMins > 0 ? (allocatedMins / data.availableMins) * 100 : 0;

    views.push({
      resourceCode: data.resourceCode,
      bucket: data.bucket,
      availableMins: data.availableMins,
      allocatedMins,
      utilizationPercent: Math.min(100, utilizationPercent), // Cap at 100%
      workOrders: data.workOrders.map((wo) => ({
        workOrderId: wo.workOrderId,
        itemCode: wo.itemCode,
        quantity: wo.quantity,
        startDate: wo.startDate,
        endDate: wo.endDate,
      })),
    });
  }

  return views;
}

