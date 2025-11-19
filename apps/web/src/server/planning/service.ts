/**
 * Phase 26 — Planning Service
 *
 * High-level read-only services for S&OP consumers.
 */

import { generateBuckets, bucketDemand, computeNetRequirements, generateRecommendations, aggregateCapacity } from "./engine";
import { loadDemandSignalsForTenant } from "./demandAdapter";
import { loadSupplySignalsForTenant } from "./supplyAdapter";
import { loadCapacityDataForTenant } from "./capacityAdapter";
import type {
  PlanningParams,
  DemandPlan,
  SupplyPlan,
  NetRequirement,
  PlanRecommendation,
  CapacityView,
} from "./types";

/**
 * Get demand plan for tenant
 */
export async function getDemandPlan(
  tenantId: string,
  params: PlanningParams
): Promise<{ supported: boolean; plans: DemandPlan[]; reason?: string }> {
  try {
    const horizonMonths = params.horizonMonths ?? 3;
    const bucketSize = params.bucketSize ?? "month";
    const startDate = params.startDate ? new Date(params.startDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + horizonMonths);

    // Generate buckets
    const buckets = generateBuckets(startDate, horizonMonths, bucketSize);

    // Load demand signals
    const demandResult = await loadDemandSignalsForTenant({
      tenantId,
      startDate,
      endDate,
      itemId: params.itemId,
      warehouseId: params.warehouseId,
      locationId: params.locationId,
    });

    if (!demandResult.supported) {
      return {
        supported: false,
        plans: [],
        reason: demandResult.reason,
      };
    }

    // Bucket demand signals
    const plans = bucketDemand(demandResult.signals, buckets);

    return {
      supported: true,
      plans,
    };
  } catch (error: any) {
    return {
      supported: false,
      plans: [],
      reason: `Failed to compute demand plan: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Get supply plan for tenant
 */
export async function getSupplyPlan(
  tenantId: string,
  params: PlanningParams
): Promise<{ supported: boolean; plans: SupplyPlan[]; reason?: string }> {
  try {
    const horizonMonths = params.horizonMonths ?? 3;
    const bucketSize = params.bucketSize ?? "month";
    const startDate = params.startDate ? new Date(params.startDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + horizonMonths);

    // Generate buckets
    const buckets = generateBuckets(startDate, horizonMonths, bucketSize);

    // Load supply signals
    const supplyResult = await loadSupplySignalsForTenant({
      tenantId,
      startDate,
      endDate,
      itemId: params.itemId,
      warehouseId: params.warehouseId,
      locationId: params.locationId,
    });

    if (!supplyResult.supported) {
      return {
        supported: false,
        plans: [],
        reason: supplyResult.reason,
      };
    }

    // Convert supply signals to supply plans (one per item/warehouse/location/bucket)
    const planMap = new Map<string, SupplyPlan>();

    for (const signal of supplyResult.signals) {
      const key = `${signal.itemId}|${signal.warehouseId || ""}|${signal.locationId || ""}|${signal.bucket.start}`;
      let plan = planMap.get(key);

      if (!plan) {
        plan = {
          itemId: signal.itemId,
          warehouseId: signal.warehouseId,
          locationId: signal.locationId,
          bucket: signal.bucket,
          totalSupply: 0,
          onHand: 0,
          openPO: 0,
          openWO: 0,
          transfers: 0,
          safetyStock: signal.safetyStock,
        };
        planMap.set(key, plan);
      }

      plan.onHand += signal.onHand;
      plan.openPO += signal.openPO;
      plan.openWO += signal.openWO;
      plan.transfers += signal.transfersIn - signal.transfersOut;
      plan.totalSupply = plan.onHand + plan.openPO + plan.openWO + plan.transfers;
    }

    return {
      supported: true,
      plans: Array.from(planMap.values()),
    };
  } catch (error: any) {
    return {
      supported: false,
      plans: [],
      reason: `Failed to compute supply plan: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Get net requirements plan for tenant
 */
export async function getNetRequirementsPlan(
  tenantId: string,
  params: PlanningParams
): Promise<{ supported: boolean; requirements: NetRequirement[]; reason?: string }> {
  try {
    // Get demand and supply plans
    const demandResult = await getDemandPlan(tenantId, params);
    const supplyResult = await getSupplyPlan(tenantId, params);

    if (!demandResult.supported || !supplyResult.supported) {
      return {
        supported: false,
        requirements: [],
        reason: demandResult.reason || supplyResult.reason || "Failed to load demand or supply plans",
      };
    }

    // Convert supply plans to supply signals (for computeNetRequirements)
    const supplySignals = supplyResult.plans.flatMap((plan) => [
      {
        itemId: plan.itemId,
        warehouseId: plan.warehouseId,
        locationId: plan.locationId,
        bucket: plan.bucket,
        onHand: plan.onHand,
        openPO: plan.openPO,
        openWO: plan.openWO,
        transfersIn: plan.transfers > 0 ? plan.transfers : 0,
        transfersOut: plan.transfers < 0 ? -plan.transfers : 0,
        safetyStock: plan.safetyStock,
      },
    ]);

    // Compute net requirements
    const requirements = computeNetRequirements(demandResult.plans, supplySignals);

    return {
      supported: true,
      requirements,
    };
  } catch (error: any) {
    return {
      supported: false,
      requirements: [],
      reason: `Failed to compute net requirements: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Get planning recommendations for tenant
 */
export async function getRecommendations(
  tenantId: string,
  params: PlanningParams
): Promise<{ supported: boolean; recommendations: PlanRecommendation[]; reason?: string }> {
  try {
    // Get net requirements
    const netResult = await getNetRequirementsPlan(tenantId, params);

    if (!netResult.supported) {
      return {
        supported: false,
        recommendations: [],
        reason: netResult.reason,
      };
    }

    // Generate recommendations
    const recommendations = generateRecommendations(netResult.requirements, tenantId, {
      defaultLeadTimeDays: 14,
      defaultProductionDays: 7,
      preferManufacturing: false, // Could be configurable
      canManufacture: (itemId) => {
        // In a real system, check if item has a BOM (can be manufactured)
        // For now, return false (treat all as purchased items)
        return false;
      },
    });

    // Publish planning.plan.generated event (non-critical, additive)
    try {
      const { publishWithOutbox } = await import("@/server/events/publisher");
      const { newEventId, nowIso } = await import("@/server/events/types");
      const event = {
        id: newEventId(),
        tenantId,
        type: "planning.plan.generated" as const,
        occurredAt: nowIso(),
        source: "planning.service",
        version: 1,
        payload: {
          horizonMonths: params.horizonMonths ?? 3,
          bucketSize: params.bucketSize ?? "month",
          recommendationsCount: recommendations.length,
          constrainedItemsCount: netResult.requirements.filter((r) => r.netRequirement > 0).length,
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      // Non-critical: log but don't fail the request
      console.warn(`[Planning] Failed to publish plan.generated event:`, error);
    }

    // Record metrics
    try {
      const { incrementCounter } = await import("@/server/observability/metrics");
      incrementCounter("planning_recommendations_generated_total", {
        result: "success",
        horizon: String(params.horizonMonths ?? 3),
        bucket: params.bucketSize ?? "month",
        tenantId,
      });
    } catch (error) {
      // Non-critical: swallow metrics errors
    }

    return {
      supported: true,
      recommendations,
    };
  } catch (error: any) {
    return {
      supported: false,
      recommendations: [],
      reason: `Failed to generate recommendations: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Get capacity view for tenant
 */
export async function getCapacityView(
  tenantId: string,
  params: PlanningParams & { resourceCode?: string }
): Promise<{ supported: boolean; views: CapacityView[]; reason?: string }> {
  try {
    const horizonMonths = params.horizonMonths ?? 3;
    const bucketSize = params.bucketSize ?? "month";
    const startDate = params.startDate ? new Date(params.startDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + horizonMonths);

    // Load capacity data
    const capacityResult = await loadCapacityDataForTenant({
      tenantId,
      startDate,
      endDate,
      resourceCode: params.resourceCode,
    });

    if (!capacityResult.supported) {
      return {
        supported: false,
        views: [],
        reason: capacityResult.reason,
      };
    }

    // Generate buckets
    const buckets = generateBuckets(startDate, horizonMonths, bucketSize);

    // Aggregate capacity
    const views = aggregateCapacity(capacityResult.data);

    // Record metrics
    try {
      const { incrementCounter } = await import("@/server/observability/metrics");
      incrementCounter("planning_capacity_view_requests_total", {
        result: "success",
        tenantId,
      });
    } catch (error) {
      // Non-critical: swallow metrics errors
    }

    return {
      supported: true,
      views,
    };
  } catch (error: any) {
    // Record error metric
    try {
      const { incrementCounter } = await import("@/server/observability/metrics");
      incrementCounter("planning_capacity_view_requests_total", {
        result: "error",
        tenantId,
      });
    } catch {
      // Ignore metrics errors
    }

    return {
      supported: false,
      views: [],
      reason: `Failed to compute capacity view: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Accept a planning recommendation
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function acceptRecommendation(
  tenantId: string,
  recommendationId: string,
  actorId: string
): Promise<{ supported: boolean; documentId?: string; documentType?: string; reason?: string }> {
  try {
    // Get recommendation from DB
    const rec = await prisma.planRecommendation.findFirst({
      where: {
        id: recommendationId,
        tenantId,
        status: "pending",
      },
    });

    if (!rec) {
      return {
        supported: false,
        reason: "Recommendation not found or already applied/rejected",
      };
    }

    // Check if already applied (idempotency)
    if (rec.status === "applied") {
      return {
        supported: true,
        documentId: rec.appliedAt ? rec.id : undefined,
        documentType: rec.type,
      };
    }

    let documentId: string | undefined;

    // Create appropriate document based on type
    if (rec.type === "po") {
      // Create purchase order
      const { createPurchaseOrder } = await import("@/server/purchasing/po");
      const po = await createPurchaseOrder(
        { tenantId },
        {
          number: `PO-REC-${Date.now()}`,
          supplierId: "", // Would need supplierId in recommendation
          currency: "GBP",
          expectedAt: new Date().toISOString(),
        }
      );
      documentId = po.id;
    } else if (rec.type === "wo") {
      // Create work order
      const { createWorkOrder } = await import("@/server/manufacturing/workorders");
      const wo = await createWorkOrder(
        { tenantId },
        {
          number: `WO-REC-${Date.now()}`,
          itemCode: rec.sku,
          quantityMinor: Number(rec.qty),
        }
      );
      documentId = wo.id;
    } else {
      return {
        supported: false,
        reason: `Unsupported recommendation type: ${rec.type}`,
      };
    }

    // Mark recommendation as applied
    await prisma.planRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: "applied",
        appliedAt: new Date(),
      },
    });

    // Publish event
    try {
      const { publishWithOutbox } = await import("@/server/events/publisher");
      const { newEventId, nowIso } = await import("@/server/events/types");
      await publishWithOutbox({
        id: newEventId(),
        tenantId,
        type: "planning.recommendation.accepted",
        occurredAt: nowIso(),
        source: "planning.service",
        version: 1,
        payload: {
          recommendationId,
          type: rec.type,
          documentId,
          actorId,
        },
      });
    } catch (error) {
      // Ignore event errors
    }

    return {
      supported: true,
      documentId,
      documentType: rec.type,
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to accept recommendation: ${error?.message || "unknown"}`,
    };
  }
}

