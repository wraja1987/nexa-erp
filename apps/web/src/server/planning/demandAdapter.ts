/**
 * Phase 26 — Demand Adapter
 *
 * Reads demand signals from existing schema (read-only, tenant-scoped).
 */

import { prisma } from "@/lib/prisma";
import type { DemandSignal, PlanningBucket } from "./types";

export interface LoadDemandSignalsParams {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  itemId?: string;
  warehouseId?: string;
  locationId?: string;
}

/**
 * Load demand signals from Work Orders (via BOM explosion)
 */
async function loadDemandFromWorkOrders(
  params: LoadDemandSignalsParams
): Promise<DemandSignal[]> {
  const signals: DemandSignal[] = [];

  // Get planned/in-progress work orders within date range
  const workOrders = await prisma.workOrder.findMany({
    where: {
      tenantId: params.tenantId,
      status: { in: ["planned", "in_progress"] as any },
      OR: [
        { endPlanned: null },
        { endPlanned: { gte: params.startDate, lte: params.endDate } },
      ],
    },
  });

  // For each WO, explode BOM to get component demand
  for (const wo of workOrders) {
    const bomItems = await prisma.bomItem.findMany({
      where: {
        tenantId: params.tenantId,
        parentItemCode: wo.itemCode,
      },
    });

    for (const bomItem of bomItems) {
      // Skip if item filter doesn't match
      if (params.itemId && bomItem.componentItemCode !== params.itemId) continue;

      const woQuantity = Number(wo.quantity || 0);
      const bomQuantity = Number(bomItem.quantity || 0);
      const componentDemand = woQuantity * bomQuantity;

      // Determine bucket from WO planned end date (or start if end is null)
      const bucketDate = wo.endPlanned || wo.startPlanned || new Date();
      const bucket: PlanningBucket = {
        start: bucketDate.toISOString().split("T")[0],
        end: bucketDate.toISOString().split("T")[0], // Single day bucket for now
      };

      signals.push({
        itemId: bomItem.componentItemCode,
        warehouseId: params.warehouseId,
        locationId: params.locationId,
        bucket,
        quantityMinor: componentDemand,
        source: "work_order",
        metadata: {
          workOrderId: wo.id,
          workOrderNumber: wo.number,
          parentItemCode: wo.itemCode,
        },
      });
    }
  }

  return signals;
}

/**
 * Load demand signals from Customer Invoices (approximate, no line items)
 *
 * Schema gap: CustomerInvoice has no line items, so we can only use aggregate totals.
 * This is a best-effort approximation.
 */
async function loadDemandFromInvoices(
  params: LoadDemandSignalsParams
): Promise<DemandSignal[]> {
  const signals: DemandSignal[] = [];

  // Get invoices within date range
  const invoices = await prisma.customerInvoice.findMany({
    where: {
      tenantId: params.tenantId,
      issuedAt: { gte: params.startDate, lte: params.endDate },
      status: { not: "cancelled" },
    },
  });

  // Schema gap: No line items, so we can't derive item-level demand accurately
  // For now, return empty array (or could use aggregate totals if needed)
  // In a real system, we'd need InvoiceLineItem model

  return signals;
}

/**
 * Load all demand signals for tenant
 */
export async function loadDemandSignalsForTenant(
  params: LoadDemandSignalsParams
): Promise<{ supported: boolean; signals: DemandSignal[]; reason?: string }> {
  try {
    const signals: DemandSignal[] = [];

    // Load from Work Orders (BOM explosion)
    const woSignals = await loadDemandFromWorkOrders(params);
    signals.push(...woSignals);

    // Load from Invoices (limited due to schema gap)
    const invoiceSignals = await loadDemandFromInvoices(params);
    signals.push(...invoiceSignals);

    return {
      supported: true,
      signals,
    };
  } catch (error: any) {
    return {
      supported: false,
      signals: [],
      reason: `Failed to load demand signals: ${error?.message || "Unknown error"}`,
    };
  }
}

