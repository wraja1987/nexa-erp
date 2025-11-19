import { describe, it, expect, beforeEach, vi } from "vitest";
import { listTenantsWithSummary, getTenantDetail, suspendTenant } from "../superadminTenants";
import { prisma } from "@/lib/prisma";

// Mock Prisma and dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    tenant: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    subscription: {
      count: vi.fn(),
    },
    session: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/server/security/byokProvider", () => ({
  getTenantKey: vi.fn(),
  getTenantRegion: vi.fn(),
}));

vi.mock("@/server/security/byokConfig", () => ({
  BYOK_ENABLED: false,
  BYOK_KEY_PROVIDER: "none",
}));

describe("Super Admin Services (Phase 27)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTenantsWithSummary", () => {
    it("should list tenants with summary metrics", async () => {
      (prisma.tenant.findMany as any).mockResolvedValue([
        {
          id: "tenant1",
          name: "Test Tenant",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      (prisma.user.count as any).mockResolvedValue(5);
      (prisma.subscription.count as any).mockResolvedValue(1);
      (prisma.session.findFirst as any).mockResolvedValue(null);

      const tenants = await listTenantsWithSummary();

      expect(tenants).toHaveLength(1);
      expect(tenants[0].id).toBe("tenant1");
      expect(tenants[0].userCount).toBe(5);
      expect(tenants[0].status).toBe("unknown"); // Schema gap
    });
  });

  describe("getTenantDetail", () => {
    it("should return tenant detail with BYOK and residency status", async () => {
      const { getTenantKey, getTenantRegion } = await import("@/server/security/byokProvider");
      (prisma.tenant.findUnique as any).mockResolvedValue({
        id: "tenant1",
        name: "Test Tenant",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (prisma.user.count as any).mockResolvedValue(5);
      (prisma.subscription.count as any).mockResolvedValue(1);
      (prisma.session.findFirst as any).mockResolvedValue(null);
      (getTenantKey as any).mockResolvedValue({
        supported: false,
        reason: "Schema gap",
      });
      (getTenantRegion as any).mockResolvedValue("UNKNOWN");

      const detail = await getTenantDetail("tenant1");

      expect(detail).toBeDefined();
      expect(detail?.id).toBe("tenant1");
      expect(detail?.byokStatus.supported).toBe(false);
      expect(detail?.dataResidencyStatus.region).toBe("UNKNOWN");
    });
  });

  describe("suspendTenant", () => {
    it("should return supported:false due to schema gap", async () => {
      const result = await suspendTenant("tenant1");

      expect(result.supported).toBe(false);
      expect(result.reason).toContain("schema gap");
    });
  });
});

