import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkWorkflowTransition } from "../enforcer";
import { buildInvoiceContext } from "../context";
import { prisma } from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    customerInvoice: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Workflow Integration — Finance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows STAFF to approve low-amount invoice", async () => {
    // Mock invoice with low amount
    (prisma.customerInvoice.findUnique as any).mockResolvedValue({
      id: "inv-1",
      tenantId: "tenant-1",
      status: "draft",
      lines: [{ qty: 1, price: 500 }], // Total: 500 (< 1000)
    });

    const context = await buildInvoiceContext("inv-1", "tenant-1", "user-1", "STAFF");
    const result = await checkWorkflowTransition({
      entityType: "finance.invoice",
      entityId: "inv-1",
      tenantId: "tenant-1",
      actorId: "user-1",
      actorRole: "STAFF",
      action: "approve",
    });

    expect(result.allowed).toBe(true);
  });

  it("denies STAFF approval for medium-amount invoice", async () => {
    // Mock invoice with medium amount
    (prisma.customerInvoice.findUnique as any).mockResolvedValue({
      id: "inv-2",
      tenantId: "tenant-1",
      status: "draft",
      lines: [{ qty: 1, price: 5000 }], // Total: 5000 (>= 1000, < 10000)
    });

    const result = await checkWorkflowTransition({
      entityType: "finance.invoice",
      entityId: "inv-2",
      tenantId: "tenant-1",
      actorId: "user-1",
      actorRole: "STAFF",
      action: "approve",
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Conditions not met");
  });

  it("allows MANAGER approval for medium-amount invoice", async () => {
    // Mock invoice with medium amount
    (prisma.customerInvoice.findUnique as any).mockResolvedValue({
      id: "inv-3",
      tenantId: "tenant-1",
      status: "draft",
      lines: [{ qty: 1, price: 5000 }], // Total: 5000 (>= 1000, < 10000)
    });

    const result = await checkWorkflowTransition({
      entityType: "finance.invoice",
      entityId: "inv-3",
      tenantId: "tenant-1",
      actorId: "user-1",
      actorRole: "MANAGER",
      action: "approve",
    });

    expect(result.allowed).toBe(true);
  });

  it("denies MANAGER approval for high-amount invoice", async () => {
    // Mock invoice with high amount
    (prisma.customerInvoice.findUnique as any).mockResolvedValue({
      id: "inv-4",
      tenantId: "tenant-1",
      status: "draft",
      lines: [{ qty: 1, price: 15000 }], // Total: 15000 (>= 10000)
    });

    const result = await checkWorkflowTransition({
      entityType: "finance.invoice",
      entityId: "inv-4",
      tenantId: "tenant-1",
      actorId: "user-1",
      actorRole: "MANAGER",
      action: "approve",
    });

    expect(result.allowed).toBe(false);
  });

  it("allows ADMIN approval for high-amount invoice", async () => {
    // Mock invoice with high amount
    (prisma.customerInvoice.findUnique as any).mockResolvedValue({
      id: "inv-5",
      tenantId: "tenant-1",
      status: "draft",
      lines: [{ qty: 1, price: 15000 }], // Total: 15000 (>= 10000)
    });

    const result = await checkWorkflowTransition({
      entityType: "finance.invoice",
      entityId: "inv-5",
      tenantId: "tenant-1",
      actorId: "user-1",
      actorRole: "ADMIN",
      action: "approve",
    });

    expect(result.allowed).toBe(true);
  });
});

