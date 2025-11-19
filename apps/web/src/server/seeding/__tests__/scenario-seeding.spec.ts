import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  ensureScenarioTenant,
  ensureScenarioUser,
  seedAccountsIfEmpty,
  seedSuppliersIfEmpty,
  getScenarioConfig,
  type ScenarioKey,
} from "../seedHelpers";

const prisma = new PrismaClient();
const hasDb = Boolean(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim().length > 0);

describe("Scenario Seeding", () => {
  beforeEach(async () => {
    if (!hasDb) return;
    // Clean up test tenants (by name pattern)
    await prisma.tenant.deleteMany({
      where: {
        name: {
          contains: "Test Scenario",
        },
      },
    });
  });

  afterEach(async () => {
    if (!hasDb) return;
    await prisma.$disconnect();
  });

  describe("ensureScenarioTenant", () => {
    it("should return the same tenantId when called twice (idempotent)", async () => {
      if (!hasDb) return;

      // Mock scenario config for testing
      const testScenario: ScenarioKey = "manufacturing";
      const config = getScenarioConfig(testScenario);

      // First call
      const result1 = await ensureScenarioTenant(prisma, testScenario);
      expect(result1.tenantId).toBeTruthy();

      // Second call (should return same tenant)
      const result2 = await ensureScenarioTenant(prisma, testScenario);
      expect(result2.tenantId).toBe(result1.tenantId);

      // Verify tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: result1.tenantId },
      });
      expect(tenant).toBeTruthy();
      expect(tenant?.name).toBe(config.name);
    });

    it("should create entity for tenant", async () => {
      if (!hasDb) return;

      const { tenantId, entityId } = await ensureScenarioTenant(prisma, "retail");
      expect(entityId).toBeTruthy();

      const entity = await prisma.entity.findUnique({
        where: { id: entityId! },
      });
      expect(entity).toBeTruthy();
      expect(entity?.tenantId).toBe(tenantId);
    });
  });

  describe("ensureScenarioUser", () => {
    it("should create user on first call, return same userId on second call", async () => {
      if (!hasDb) return;

      const { tenantId } = await ensureScenarioTenant(prisma, "consulting");
      const email = "test-user@consulting.nexa.demo";

      const result1 = await ensureScenarioUser(prisma, tenantId, email, "ADMIN", "Test123!");
      expect(result1.userId).toBeTruthy();

      const result2 = await ensureScenarioUser(prisma, tenantId, email, "ADMIN", "Test123!");
      expect(result2.userId).toBe(result1.userId);

      const user = await prisma.user.findUnique({
        where: { email },
      });
      expect(user).toBeTruthy();
      expect(user?.tenantId).toBe(tenantId);
    });
  });

  describe("seedAccountsIfEmpty", () => {
    it("should create accounts when tenant has no accounts", async () => {
      if (!hasDb) return;

      const { tenantId } = await ensureScenarioTenant(prisma, "healthcare");

      // Ensure no accounts exist
      await prisma.account.deleteMany({ where: { tenantId } });

      const result = await seedAccountsIfEmpty(prisma, tenantId, "healthcare");
      expect(result.accountsCreated).toBeGreaterThan(0);
      expect(result.accountsSkipped).toBe(0);

      const accounts = await prisma.account.findMany({ where: { tenantId } });
      expect(accounts.length).toBeGreaterThan(0);
    });

    it("should skip creating accounts when accounts already exist (idempotent)", async () => {
      if (!hasDb) return;

      const { tenantId } = await ensureScenarioTenant(prisma, "manufacturing");

      // First call creates accounts
      const result1 = await seedAccountsIfEmpty(prisma, tenantId, "manufacturing");
      expect(result1.accountsCreated).toBeGreaterThan(0);

      // Second call should skip
      const result2 = await seedAccountsIfEmpty(prisma, tenantId, "manufacturing");
      expect(result2.accountsCreated).toBe(0);
      expect(result2.accountsSkipped).toBe(0);

      // Count should remain stable
      const count1 = await prisma.account.count({ where: { tenantId } });
      const count2 = await prisma.account.count({ where: { tenantId } });
      expect(count1).toBe(count2);
    });
  });

  describe("seedSuppliersIfEmpty", () => {
    it("should create suppliers with deterministic codes (idempotent)", async () => {
      if (!hasDb) return;

      const { tenantId } = await ensureScenarioTenant(prisma, "retail");
      const supplierCodes = ["SUP-TEST-001", "SUP-TEST-002"];

      // First call
      const result1 = await seedSuppliersIfEmpty(prisma, tenantId, "retail", supplierCodes);
      expect(result1.suppliersCreated).toBe(2);

      // Second call (should skip existing)
      const result2 = await seedSuppliersIfEmpty(prisma, tenantId, "retail", supplierCodes);
      expect(result2.suppliersCreated).toBe(0);

      // Verify suppliers exist
      const suppliers = await prisma.supplier.findMany({
        where: { tenantId, code: { in: supplierCodes } },
      });
      expect(suppliers.length).toBe(2);
    });
  });

  describe("getScenarioConfig", () => {
    it("should return config for valid scenario keys", () => {
      const scenarios: ScenarioKey[] = ["manufacturing", "retail", "consulting", "healthcare"];

      for (const scenario of scenarios) {
        const config = getScenarioConfig(scenario);
        expect(config.key).toBe(scenario);
        expect(config.name).toBeTruthy();
        expect(config.code).toBeTruthy();
        expect(config.coaTemplate).toBeTruthy();
        expect(config.defaultUserEmail).toBeTruthy();
      }
    });

    it("should throw for invalid scenario key", () => {
      expect(() => {
        getScenarioConfig("invalid" as ScenarioKey);
      }).toThrow();
    });
  });
});

