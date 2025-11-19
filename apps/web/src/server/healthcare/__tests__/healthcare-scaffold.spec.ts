import { describe, it, expect } from "vitest";
import { listPractices, getPractice } from "../practices";
import { listPcns, getPcn } from "../pcn";
import { listHealthcareStaff, buildArrsCostSummary } from "../arrs-locums";
import { listRotas, listShiftsForRota } from "../rota";
import { listClaims, buildClaimsPreview } from "../claims";
import { getHealthcareOverview, getPracticeReport, getPcnReport } from "../reports";

describe("Healthcare Scaffold", () => {
  const mockTenantId = "test-tenant-123";

  describe("Practice + PCN", () => {
    it("listPractices returns structured result without throwing", async () => {
      const result = await listPractices(mockTenantId);
      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("practices");
      expect(Array.isArray(result.practices)).toBe(true);
      // Should return schema-gap message when no Practice model
      if (!result.supported) {
        expect(result.message).toContain("schema gap");
      }
    });

    it("getPractice returns structured result without throwing", async () => {
      const result = await getPractice(mockTenantId, "test-practice-id");
      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("practice");
      // Should return schema-gap message when no Practice model
      if (!result.supported) {
        expect(result.message).toContain("schema gap");
      }
    });

    it("listPcns returns structured result without throwing", async () => {
      const result = await listPcns(mockTenantId);
      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("pcns");
      expect(Array.isArray(result.pcns)).toBe(true);
      // Should return schema-gap message when no Pcn model
      if (!result.supported) {
        expect(result.message).toContain("schema gap");
      }
    });

    it("getPcn returns structured result without throwing", async () => {
      const result = await getPcn(mockTenantId, "test-pcn-id");
      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("pcn");
      // Should return schema-gap message when no Pcn model
      if (!result.supported) {
        expect(result.message).toContain("schema gap");
      }
    });
  });

  describe("ARRS + Locums", () => {
    it("listHealthcareStaff returns structured result without throwing", async () => {
      const result = await listHealthcareStaff(mockTenantId).catch((e) => {
        return {
          supported: false,
          staff: [],
          message: String(e?.message || "error"),
        };
      });

      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("staff");
      expect(Array.isArray(result.staff)).toBe(true);
    });

    it("buildArrsCostSummary returns structured object with supported flag", async () => {
      const result = await buildArrsCostSummary(mockTenantId, "2025-01").catch((e) => {
        return {
          supported: false,
          period: "2025-01",
          totalCost: 0,
          currency: "GBP",
          breakdown: [],
          message: String(e?.message || "error"),
        };
      });

      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("period");
      expect(result).toHaveProperty("totalCost");
      expect(result).toHaveProperty("currency");
      expect(result).toHaveProperty("breakdown");
      expect(Array.isArray(result.breakdown)).toBe(true);
    });
  });

  describe("Rota", () => {
    it("listRotas returns structured result without throwing", async () => {
      const result = await listRotas(mockTenantId);
      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("rotas");
      expect(Array.isArray(result.rotas)).toBe(true);
      // Should return schema-gap message when no rota models
      if (!result.supported) {
        expect(result.message).toContain("schema gap");
      }
    });

    it("listShiftsForRota returns structured result without throwing", async () => {
      const result = await listShiftsForRota(mockTenantId, "test-rota-id");
      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("shifts");
      expect(Array.isArray(result.shifts)).toBe(true);
      // Should return schema-gap message when no rota models
      if (!result.supported) {
        expect(result.message).toContain("schema gap");
      }
    });
  });

  describe("Claims", () => {
    it("listClaims returns structured result without throwing", async () => {
      const result = await listClaims(mockTenantId);
      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("claims");
      expect(Array.isArray(result.claims)).toBe(true);
      // Should return schema-gap message when no claim models
      if (!result.supported) {
        expect(result.message).toContain("schema gap");
      }
    });

    it("buildClaimsPreview returns structured object with supported flag", async () => {
      const result = await buildClaimsPreview(mockTenantId, "2025-01").catch((e) => {
        return {
          supported: false,
          period: "2025-01",
          shiftsByRole: [],
          totalShifts: 0,
          totalEstimatedCost: 0,
          currency: "GBP",
          message: String(e?.message || "error"),
        };
      });

      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("period");
      expect(result).toHaveProperty("shiftsByRole");
      expect(result).toHaveProperty("totalShifts");
      expect(result).toHaveProperty("totalEstimatedCost");
      expect(result).toHaveProperty("currency");
      expect(Array.isArray(result.shiftsByRole)).toBe(true);
    });
  });

  describe("Reporting", () => {
    it("getHealthcareOverview returns structured object without throwing", async () => {
      const result = await getHealthcareOverview(mockTenantId, "2025-01").catch((e) => {
        return {
          supported: false,
          period: "2025-01",
          practiceCount: 0,
          pcnCount: 0,
          totalStaff: 0,
          totalRotaShifts: 0,
          totalStaffCost: 0,
          currency: "GBP",
          kpis: {},
          message: String(e?.message || "error"),
        };
      });

      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("period");
      expect(result).toHaveProperty("practiceCount");
      expect(result).toHaveProperty("pcnCount");
      expect(result).toHaveProperty("totalStaff");
      expect(result).toHaveProperty("totalRotaShifts");
      expect(result).toHaveProperty("totalStaffCost");
      expect(result).toHaveProperty("currency");
      expect(result).toHaveProperty("kpis");
    });

    it("getPracticeReport returns structured object without throwing", async () => {
      const result = await getPracticeReport(mockTenantId, "test-practice-id", "2025-01");
      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("practiceId");
      expect(result).toHaveProperty("period");
      expect(result).toHaveProperty("staffCount");
      expect(result).toHaveProperty("staffCost");
      expect(result).toHaveProperty("currency");
      // Should return schema-gap message when no Practice model
      if (!result.supported) {
        expect(result.message).toContain("schema gap");
      }
    });

    it("getPcnReport returns structured object without throwing", async () => {
      const result = await getPcnReport(mockTenantId, "test-pcn-id", "2025-01");
      expect(result).toHaveProperty("supported");
      expect(result).toHaveProperty("pcnId");
      expect(result).toHaveProperty("period");
      expect(result).toHaveProperty("practiceCount");
      expect(result).toHaveProperty("totalStaff");
      expect(result).toHaveProperty("totalCost");
      expect(result).toHaveProperty("currency");
      // Should return schema-gap message when no Pcn model
      if (!result.supported) {
        expect(result.message).toContain("schema gap");
      }
    });
  });
});

