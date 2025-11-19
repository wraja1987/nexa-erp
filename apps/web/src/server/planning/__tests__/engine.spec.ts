import { describe, it, expect } from "vitest";
import {
  generateBuckets,
  bucketDemand,
  computeNetRequirements,
  generateRecommendations,
  aggregateCapacity,
} from "../engine";
import type { DemandSignal, SupplySignal, PlanningBucket } from "../types";

describe("Planning Engine", () => {
  describe("generateBuckets", () => {
    it("should generate weekly buckets", () => {
      const start = new Date("2025-01-01");
      const buckets = generateBuckets(start, 1, "week"); // 1 month = ~4 weeks

      expect(buckets.length).toBeGreaterThanOrEqual(4);
      expect(buckets[0].start).toBe("2025-01-01");
      expect(buckets[0].end).toBe("2025-01-08");
    });

    it("should generate monthly buckets", () => {
      const start = new Date("2025-01-01");
      const buckets = generateBuckets(start, 3, "month");

      expect(buckets.length).toBe(3);
      expect(buckets[0].start).toBe("2025-01-01");
      expect(buckets[1].start).toBe("2025-02-01");
      expect(buckets[2].start).toBe("2025-03-01");
    });
  });

  describe("bucketDemand", () => {
    it("should bucket demand signals by time bucket", () => {
      const buckets: PlanningBucket[] = [
        { start: "2025-01-01", end: "2025-01-31" },
        { start: "2025-02-01", end: "2025-02-28" },
      ];

      const signals: DemandSignal[] = [
        {
          itemId: "ITEM1",
          bucket: { start: "2025-01-15", end: "2025-01-15" },
          quantityMinor: 100,
          source: "work_order",
        },
        {
          itemId: "ITEM1",
          bucket: { start: "2025-01-20", end: "2025-01-20" },
          quantityMinor: 50,
          source: "work_order",
        },
        {
          itemId: "ITEM2",
          bucket: { start: "2025-02-10", end: "2025-02-10" },
          quantityMinor: 200,
          source: "work_order",
        },
      ];

      const plans = bucketDemand(signals, buckets);

      expect(plans.length).toBeGreaterThan(0);
      const janPlan = plans.find((p) => p.itemId === "ITEM1" && p.bucket.start === "2025-01-01");
      expect(janPlan).toBeDefined();
      expect(janPlan?.totalDemand).toBe(150); // 100 + 50
    });
  });

  describe("computeNetRequirements", () => {
    it("should compute net requirements correctly", () => {
      const demandPlans = [
        {
          itemId: "ITEM1",
          bucket: { start: "2025-01-01", end: "2025-01-31" },
          totalDemand: 100,
          signals: [],
        },
      ];

      const supplySignals: SupplySignal[] = [
        {
          itemId: "ITEM1",
          bucket: { start: "2025-01-01", end: "2025-01-31" },
          onHand: 50,
          openPO: 30,
          openWO: 0,
          transfersIn: 0,
          transfersOut: 0,
          safetyStock: 10,
        },
      ];

      const requirements = computeNetRequirements(demandPlans, supplySignals);

      expect(requirements.length).toBe(1);
      expect(requirements[0].demand).toBe(100);
      expect(requirements[0].supply).toBe(80); // 50 + 30
      expect(requirements[0].netRequirement).toBeGreaterThan(0); // 100 - 80 + 10 (safety stock)
    });

    it("should handle surplus (negative net requirement)", () => {
      const demandPlans = [
        {
          itemId: "ITEM1",
          bucket: { start: "2025-01-01", end: "2025-01-31" },
          totalDemand: 50,
          signals: [],
        },
      ];

      const supplySignals: SupplySignal[] = [
        {
          itemId: "ITEM1",
          bucket: { start: "2025-01-01", end: "2025-01-31" },
          onHand: 100,
          openPO: 0,
          openWO: 0,
          transfersIn: 0,
          transfersOut: 0,
          safetyStock: 10,
        },
      ];

      const requirements = computeNetRequirements(demandPlans, supplySignals);

      expect(requirements[0].netRequirement).toBe(0); // Max(0, 50 - 100 + 10) = 0
    });
  });

  describe("generateRecommendations", () => {
    it("should generate recommendations for shortages", () => {
      const netRequirements = [
        {
          itemId: "ITEM1",
          bucket: { start: "2025-01-01", end: "2025-01-31" },
          demand: 100,
          supply: 50,
          netRequirement: 50,
          safetyStock: 10,
        },
      ];

      const recommendations = generateRecommendations(netRequirements, "tenant1");

      expect(recommendations.length).toBe(1);
      expect(recommendations[0].type).toBe("purchase_order");
      expect(recommendations[0].quantityMinor).toBe(50);
      expect(recommendations[0].itemId).toBe("ITEM1");
    });

    it("should not generate recommendations for surpluses", () => {
      const netRequirements = [
        {
          itemId: "ITEM1",
          bucket: { start: "2025-01-01", end: "2025-01-31" },
          demand: 50,
          supply: 100,
          netRequirement: 0,
          safetyStock: 10,
        },
      ];

      const recommendations = generateRecommendations(netRequirements, "tenant1");

      expect(recommendations.length).toBe(0);
    });
  });

  describe("aggregateCapacity", () => {
    it("should aggregate capacity correctly", () => {
      const capacityData = [
        {
          resourceCode: "RES1",
          bucket: { start: "2025-01-01", end: "2025-01-07" },
          availableMins: 480, // 8 hours
          workOrders: [
            {
              workOrderId: "WO1",
              itemCode: "ITEM1",
              quantity: 10,
              startDate: "2025-01-01",
              endDate: "2025-01-02",
              durationMins: 240, // 4 hours
            },
          ],
        },
      ];

      const views = aggregateCapacity(capacityData);

      expect(views.length).toBe(1);
      expect(views[0].resourceCode).toBe("RES1");
      expect(views[0].availableMins).toBe(480);
      expect(views[0].allocatedMins).toBe(240);
      expect(views[0].utilizationPercent).toBe(50);
    });

    it("should cap utilization at 100%", () => {
      const capacityData = [
        {
          resourceCode: "RES1",
          bucket: { start: "2025-01-01", end: "2025-01-07" },
          availableMins: 480,
          workOrders: [
            {
              workOrderId: "WO1",
              itemCode: "ITEM1",
              quantity: 10,
              startDate: "2025-01-01",
              endDate: "2025-01-02",
              durationMins: 600, // Over capacity
            },
          ],
        },
      ];

      const views = aggregateCapacity(capacityData);

      expect(views[0].utilizationPercent).toBeLessThanOrEqual(100);
    });
  });
});

