/**
 * Phase 26 — Capacity Adapter
 *
 * Reads capacity data from existing schema (read-only, tenant-scoped).
 */

import { prisma } from "@/lib/prisma";
import type { PlanningBucket } from "./types";

export interface LoadCapacityDataParams {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  resourceCode?: string;
}

export interface CapacityViewInput {
  resourceCode: string;
  bucket: PlanningBucket;
  availableMins: number;
  workOrders: Array<{
    workOrderId: string;
    itemCode: string;
    quantity: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    durationMins: number;
  }>;
}

/**
 * Load capacity data from CapacityCalendar and WorkOrders
 */
export async function loadCapacityDataForTenant(
  params: LoadCapacityDataParams
): Promise<{ supported: boolean; data: CapacityViewInput[]; reason?: string }> {
  try {
    const data: CapacityViewInput[] = [];

    // Load capacity calendar entries
    const capacityWhere: any = {
      tenantId: params.tenantId,
      date: { gte: params.startDate, lte: params.endDate },
    };

    if (params.resourceCode) {
      capacityWhere.resourceCode = params.resourceCode;
    }

    const capacityEntries = await prisma.capacityCalendar.findMany({
      where: capacityWhere,
      orderBy: [{ resourceCode: "asc" }, { date: "asc" }],
    });

    // Group by resource and date (bucket)
    const capacityMap = new Map<string, number>(); // "resourceCode|date" -> availableMins

    for (const entry of capacityEntries) {
      const key = `${entry.resourceCode}|${entry.date.toISOString().split("T")[0]}`;
      capacityMap.set(key, entry.availableMins);
    }

    // Load work orders with routing steps
    const workOrderWhere: any = {
      tenantId: params.tenantId,
      status: { in: ["planned", "in_progress"] as any },
      OR: [
        { endPlanned: null },
        { endPlanned: { gte: params.startDate, lte: params.endDate } },
      ],
    };

    const workOrders = await prisma.workOrder.findMany({
      where: workOrderWhere,
      include: {
        steps: {
          orderBy: { seq: "asc" },
        },
      },
    });

    // Group WOs by resource and bucket
    const woMap = new Map<string, CapacityViewInput["workOrders"]>(); // "resourceCode|bucketStart" -> workOrders[]

    for (const wo of workOrders) {
      const startDate = wo.startPlanned || wo.createdAt;
      const endDate = wo.endPlanned || startDate;

      // Calculate total duration from routing steps
      let totalDurationMins = 0;
      const resourceCodes = new Set<string>();

      for (const step of wo.steps) {
        if (step.resourceCode) {
          resourceCodes.add(step.resourceCode);
          totalDurationMins += step.durationMins || 0;
        }
      }

      // If no routing steps, use a default duration
      if (totalDurationMins === 0) {
        totalDurationMins = 480; // Default 8 hours
      }

      // Assign WO to each resource it uses
      for (const resourceCode of resourceCodes.size > 0 ? Array.from(resourceCodes) : ["DEFAULT"]) {
        // Determine bucket (simplified: use start date)
        const bucketStart = startDate.toISOString().split("T")[0];
        const key = `${resourceCode}|${bucketStart}`;

        if (!woMap.has(key)) {
          woMap.set(key, []);
        }

        woMap.get(key)!.push({
          workOrderId: wo.id,
          itemCode: wo.itemCode,
          quantity: Number(wo.quantity || 0),
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          durationMins: totalDurationMins / resourceCodes.size, // Distribute duration across resources
        });
      }
    }

    // Combine capacity and WO data
    const combinedMap = new Map<string, CapacityViewInput>();

    // Add capacity entries
    for (const [key, availableMins] of capacityMap.entries()) {
      const [resourceCode, dateStr] = key.split("|");
      const bucket: PlanningBucket = {
        start: dateStr,
        end: dateStr, // Single day bucket
      };

      const combinedKey = `${resourceCode}|${dateStr}`;
      combinedMap.set(combinedKey, {
        resourceCode,
        bucket,
        availableMins,
        workOrders: [],
      });
    }

    // Add WO allocations
    for (const [key, workOrders] of woMap.entries()) {
      const [resourceCode, bucketStart] = key.split("|");
      const combinedKey = `${resourceCode}|${bucketStart}`;

      let view = combinedMap.get(combinedKey);
      if (!view) {
        view = {
          resourceCode,
          bucket: {
            start: bucketStart,
            end: bucketStart,
          },
          availableMins: 480, // Default 8 hours if no capacity calendar entry
          workOrders: [],
        };
        combinedMap.set(combinedKey, view);
      }

      view.workOrders = workOrders;
    }

    return {
      supported: true,
      data: Array.from(combinedMap.values()),
    };
  } catch (error: any) {
    return {
      supported: false,
      data: [],
      reason: `Failed to load capacity data: ${error?.message || "Unknown error"}`,
    };
  }
}

