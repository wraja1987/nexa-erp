import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTenantKey, getTenantRegion } from "../byokProvider";
import { encryptForTenant, decryptForTenant } from "../byokCrypto";
import { assertResidencyAllowed } from "../dataResidency";
import { BYOK_ENABLED } from "../byokConfig";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    tenantConfig: {
      findUnique: vi.fn(),
    },
    tenant: {
      findUnique: vi.fn(),
    },
    tenantKey: {
      findUnique: vi.fn(),
    },
    $queryRawUnsafe: vi.fn(),
  },
}));

// Mock BYOK config
vi.mock("../byokConfig", () => ({
  BYOK_ENABLED: false,
  BYOK_KEY_PROVIDER: "none",
}));

describe("BYOK + Data Residency Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Tenant Key Resolution", () => {
    it("returns supported:false when BYOK is disabled", async () => {
      const result = await getTenantKey("t-123");
      expect(result.supported).toBe(false);
      expect(result.reason).toContain("BYOK not enabled");
    });

    it("returns supported:false when TenantKey model is missing", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.tenantKey.findUnique).mockRejectedValue(new Error("Model not found"));

      const result = await getTenantKey("t-123");
      expect(result.supported).toBe(false);
      expect(result.reason).toContain("Schema gap");
    });

    it("returns region UNKNOWN when TenantConfig is missing", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.tenantConfig.findUnique).mockRejectedValue(new Error("Model not found"));
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue({ id: "t-123", name: "Test" } as any);

      const region = await getTenantRegion("t-123");
      expect(region).toBe("UNKNOWN");
    });
  });

  describe("Encryption/Decryption", () => {
    it("returns supported:false when BYOK is disabled", async () => {
      const result = await encryptForTenant("t-123", "plaintext");
      expect(result.supported).toBe(false);
      expect(result.reason).toContain("BYOK not enabled");
    });

    it("returns supported:false when tenant key is unavailable", async () => {
      // Mock BYOK enabled but key unavailable
      vi.doMock("../byokConfig", () => ({
        BYOK_ENABLED: true,
        BYOK_KEY_PROVIDER: "aws-kms",
      }));

      const result = await encryptForTenant("t-123", "plaintext");
      expect(result.supported).toBe(false);
    });

    it("never throws when unsupported", async () => {
      await expect(encryptForTenant("t-123", "plaintext")).resolves.not.toThrow();
      await expect(decryptForTenant("t-123", "ciphertext")).resolves.not.toThrow();
    });
  });

  describe("Residency Guards", () => {
    it("allows when requiredRegion contains UNKNOWN", async () => {
      const result = await assertResidencyAllowed("t-123", ["UK", "UNKNOWN"]);
      expect(result.allowed).toBe(true);
    });

    it("denies when tenant region is UNKNOWN and requiredRegion does not include UNKNOWN", async () => {
      const result = await assertResidencyAllowed("t-123", ["UK", "EU"]);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Schema gap");
      expect(result.tenantRegion).toBe("UNKNOWN");
    });

    it("denies when tenant region is not in required regions", async () => {
      // Mock tenant region as GCC
      vi.spyOn(await import("../byokProvider"), "getTenantRegion").mockResolvedValue("GCC");

      const result = await assertResidencyAllowed("t-123", ["UK", "EU"]);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("not in required regions");
      expect(result.tenantRegion).toBe("GCC");
    });

    it("allows when tenant region is in required regions", async () => {
      // Mock tenant region as UK
      vi.spyOn(await import("../byokProvider"), "getTenantRegion").mockResolvedValue("UK");

      const result = await assertResidencyAllowed("t-123", ["UK", "EU"]);
      expect(result.allowed).toBe(true);
      expect(result.tenantRegion).toBe("UK");
    });
  });
});

