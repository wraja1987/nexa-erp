/**
 * Phase 26 — Supply Adapter
 *
 * Reads supply signals from existing schema (read-only, tenant-scoped).
 */

import { prisma } from "@/lib/prisma";
import type { SupplySignal, PlanningBucket } from "./types";

export interface LoadSupplySignalsParams {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  itemId?: string;
  warehouseId?: string;
  locationId?: string;
}

/**
 * Calculate naive safety stock (10% of average demand or fixed minimum)
 *
 * Schema gap: No explicit safety stock field, so we compute a naive default.
 */
function calculateSafetyStock(
  itemId: string,
  averageDemand?: number
): number {
  // Naive default: 10% of average demand or minimum of 10 units
  if (averageDemand && averageDemand > 0) {
    return Math.max(10, Math.ceil(averageDemand * 0.1));
  }
  return 10; // Default minimum
}

/**
 * Load supply signals from Inventory (on-hand)
 */
async function loadSupplyFromInventory(
  params: LoadSupplySignalsParams
): Promise<SupplySignal[]> {
  const signals: SupplySignal[] = [];

  const where: any = {
    tenantId: params.tenantId,
  };

  if (params.itemId) {
    where.sku = params.itemId;
  }
  if (params.warehouseId) {
    where.warehouseId = params.warehouseId;
  }
  if (params.locationId) {
    where.locationId = params.locationId;
  }

  const inventoryItems = await prisma.inventoryItem.findMany({
    where,
  });

  // Create a supply signal for each item/warehouse/location combination
  // Use the start date as the bucket (current state)
  const bucket: PlanningBucket = {
    start: params.startDate.toISOString().split("T")[0],
    end: params.endDate.toISOString().split("T")[0],
  };

  for (const item of inventoryItems) {
    const onHand = Number(item.qtyOnHand || 0);
    const safetyStock = calculateSafetyStock(item.sku);

    signals.push({
      itemId: item.sku,
      warehouseId: item.warehouseId || undefined,
      locationId: item.locationId || undefined,
      bucket,
      onHand,
      openPO: 0, // Will be filled by loadSupplyFromPurchaseOrders
      openWO: 0, // Will be filled by loadSupplyFromWorkOrders
      transfersIn: 0,
      transfersOut: 0,
      safetyStock,
      metadata: {
        inventoryItemId: item.id,
      },
    });
  }

  return signals;
}

/**
 * Load supply signals from Purchase Orders (open POs)
 */
async function loadSupplyFromPurchaseOrders(
  params: LoadSupplySignalsParams
): Promise<Map<string, number>> {
  // Map: "itemId|warehouseId" -> quantity
  const poQuantities = new Map<string, number>();

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      tenantId: params.tenantId,
      status: { in: ["draft", "approved"] as any },
      expectedAt: { gte: params.startDate, lte: params.endDate },
    },
    include: {
      lines: true,
    },
  });

  for (const po of purchaseOrders) {
    for (const line of po.lines) {
      // Skip if item filter doesn't match
      if (params.itemId && line.sku !== params.itemId) continue;

      const key = `${line.sku}|${params.warehouseId || ""}`;
      const qty = Number(line.qty || 0);
      poQuantities.set(key, (poQuantities.get(key) || 0) + qty);
    }
  }

  return poQuantities;
}

/**
 * Load supply signals from Work Orders (finished goods production)
 */
async function loadSupplyFromWorkOrders(
  params: LoadSupplySignalsParams
): Promise<Map<string, number>> {
  // Map: "itemId|warehouseId" -> quantity
  const woQuantities = new Map<string, number>();

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

  for (const wo of workOrders) {
    // Skip if item filter doesn't match
    if (params.itemId && wo.itemCode !== params.itemId) continue;

    // Only count finished goods (not components)
    // In a real system, we'd check if this is a finished good vs component
    const key = `${wo.itemCode}|${params.warehouseId || ""}`;
    const qty = Number(wo.quantity || 0);
    woQuantities.set(key, (woQuantities.get(key) || 0) + qty);
  }

  return woQuantities;
}

/**
 * Load supply signals from ASNs (Advance Shipment Notices)
 *
 * Schema gap: ASN has no line items, so we can only use ETA as approximate signal.
 */
async function loadSupplyFromAsns(
  params: LoadSupplySignalsParams
): Promise<Map<string, number>> {
  // Map: "itemId|warehouseId" -> quantity (approximate)
  const asnQuantities = new Map<string, number>();

  const asns = await prisma.asn.findMany({
    where: {
      tenantId: params.tenantId,
      status: { in: ["created"] as any },
      eta: { gte: params.startDate, lte: params.endDate },
    },
  });

  // Schema gap: No line items, so we can't derive item-level supply accurately
  // For now, return empty map
  // In a real system, we'd need AsnLine model

  return asnQuantities;
}

/**
 * Load all supply signals for tenant
 */
export async function loadSupplySignalsForTenant(
  params: LoadSupplySignalsParams
): Promise<{ supported: boolean; signals: SupplySignal[]; reason?: string }> {
  try {
    // Load on-hand inventory
    const inventorySignals = await loadSupplyFromInventory(params);

    // Load open POs and WOs
    const poQuantities = await loadSupplyFromPurchaseOrders(params);
    const woQuantities = await loadSupplyFromWorkOrders(params);
    const asnQuantities = await loadSupplyFromAsns(params);

    // Merge PO/WO quantities into inventory signals
    const signalMap = new Map<string, SupplySignal>();

    for (const signal of inventorySignals) {
      const key = `${signal.itemId}|${signal.warehouseId || ""}|${signal.locationId || ""}|${signal.bucket.start}`;
      signalMap.set(key, signal);
    }

    // Add PO quantities
    for (const [key, qty] of poQuantities.entries()) {
      const [itemId, warehouseId] = key.split("|");
      const signalKey = `${itemId}|${warehouseId || ""}||${params.startDate.toISOString().split("T")[0]}`;
      let signal = signalMap.get(signalKey);

      if (!signal) {
        // Create new signal if item/warehouse combo doesn't exist
        signal = {
          itemId,
          warehouseId: warehouseId || undefined,
          bucket: {
            start: params.startDate.toISOString().split("T")[0],
            end: params.endDate.toISOString().split("T")[0],
          },
          onHand: 0,
          openPO: 0,
          openWO: 0,
          transfersIn: 0,
          transfersOut: 0,
          safetyStock: calculateSafetyStock(itemId),
        };
        signalMap.set(signalKey, signal);
      }

      signal.openPO += qty;
    }

    // Add WO quantities
    for (const [key, qty] of woQuantities.entries()) {
      const [itemId, warehouseId] = key.split("|");
      const signalKey = `${itemId}|${warehouseId || ""}||${params.startDate.toISOString().split("T")[0]}`;
      let signal = signalMap.get(signalKey);

      if (!signal) {
        signal = {
          itemId,
          warehouseId: warehouseId || undefined,
          bucket: {
            start: params.startDate.toISOString().split("T")[0],
            end: params.endDate.toISOString().split("T")[0],
          },
          onHand: 0,
          openPO: 0,
          openWO: 0,
          transfersIn: 0,
          transfersOut: 0,
          safetyStock: calculateSafetyStock(itemId),
        };
        signalMap.set(signalKey, signal);
      }

      signal.openWO += qty;
    }

    return {
      supported: true,
      signals: Array.from(signalMap.values()),
    };
  } catch (error: any) {
    return {
      supported: false,
      signals: [],
      reason: `Failed to load supply signals: ${error?.message || "Unknown error"}`,
    };
  }
}

