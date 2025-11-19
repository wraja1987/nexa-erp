import { describe, it, expect, beforeEach, vi } from "vitest";
import { listUsersForTenant, createTenantUser, updateTenantUserRoles, deactivateTenantUser } from "../userManagement";
import { prisma } from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    session: {
      findFirst: vi.fn(),
    },
  },
}));

describe("User Management (Phase 27)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listUsersForTenant", () => {
    it("should return only tenant-scoped users", async () => {
      (prisma.user.findMany as any).mockResolvedValue([
        {
          id: "user1",
          email: "user1@example.com",
          name: "User 1",
          role: "ADMIN",
          active: true,
          created_at: new Date(),
          updated_at: null,
        },
      ]);
      (prisma.session.findFirst as any).mockResolvedValue(null);

      const users = await listUsersForTenant("tenant1");

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe("user1@example.com");
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: "tenant1" },
        select: expect.any(Object),
        orderBy: { created_at: "desc" },
      });
    });
  });

  describe("createTenantUser", () => {
    it("should create user without password when sendInvite is false", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: "new-user",
        email: "new@example.com",
        name: "New User",
        role: "VIEWER",
        active: true,
        created_at: new Date(),
        updated_at: null,
      });

      const result = await createTenantUser(
        "tenant1",
        {
          email: "new@example.com",
          name: "New User",
          role: "VIEWER",
          sendInvite: false,
        },
        "actor1"
      );

      expect(result.supported).toBe(true);
      expect(result.user?.email).toBe("new@example.com");
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "new@example.com",
            tenantId: "tenant1",
            password_hash: null,
          }),
        })
      );
    });

    it("should return supported:false if user already exists", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "existing",
        email: "existing@example.com",
      });

      const result = await createTenantUser(
        "tenant1",
        {
          email: "existing@example.com",
        },
        "actor1"
      );

      expect(result.supported).toBe(false);
      expect(result.reason).toContain("already exists");
    });
  });

  describe("updateTenantUserRoles", () => {
    it("should update user role", async () => {
      (prisma.user.findFirst as any).mockResolvedValue({
        id: "user1",
        role: "VIEWER",
      });
      (prisma.user.update as any).mockResolvedValue({
        id: "user1",
        email: "user1@example.com",
        name: null,
        role: "ADMIN",
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await updateTenantUserRoles("tenant1", "user1", "ADMIN", "actor1");

      expect(result.supported).toBe(true);
      expect(result.user?.role).toBe("ADMIN");
    });

    it("should return supported:false if user not found", async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);

      const result = await updateTenantUserRoles("tenant1", "user1", "ADMIN", "actor1");

      expect(result.supported).toBe(false);
      expect(result.reason).toContain("not found");
    });
  });

  describe("deactivateTenantUser", () => {
    it("should deactivate user", async () => {
      (prisma.user.findFirst as any).mockResolvedValue({
        id: "user1",
        tenantId: "tenant1",
      });
      (prisma.user.update as any).mockResolvedValue({});

      const result = await deactivateTenantUser("tenant1", "user1", "actor1");

      expect(result.supported).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user1" },
        data: { active: false },
      });
    });
  });
});

