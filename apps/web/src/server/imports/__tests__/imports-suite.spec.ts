import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseCsv, mapCsvToRows, parseNumber, parseBoolean } from "../parser";
import { validateCoaRows, validateVendorRows, validateCustomerRows } from "../validation";
import { getImportSupport } from "../jobs";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    account: {
      count: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    supplier: {
      count: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    inventoryItem: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("Import Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CSV Parser", () => {
    it("parses simple CSV", () => {
      const csv = "Code,Name\n1000,Cash\n2000,Accounts Payable";
      const { rows } = parseCsv(csv);
      expect(rows).toHaveLength(3); // Header + 2 rows
      expect(rows[0]).toEqual(["Code", "Name"]);
      expect(rows[1]).toEqual(["1000", "Cash"]);
      expect(rows[2]).toEqual(["2000", "Accounts Payable"]);
    });

    it("handles quoted fields", () => {
      const csv = 'Code,Name\n"1000","Cash, Bank"';
      const { rows } = parseCsv(csv);
      expect(rows[1]).toEqual(["1000", "Cash, Bank"]);
    });

    it("maps CSV to typed rows", () => {
      const csvRows = [
        ["Code", "Name"],
        ["1000", "Cash"],
        ["2000", "AP"],
      ];

      const { rows, errors } = mapCsvToRows(
        csvRows,
        (row, rowNum) => ({
          originalRowNumber: rowNum,
          code: row[0] || "",
          name: row[1] || "",
        })
      );

      expect(rows).toHaveLength(2);
      expect(rows[0].code).toBe("1000");
      expect(errors).toHaveLength(0);
    });
  });

  describe("Number Parsing", () => {
    it("parses valid numbers", () => {
      expect(parseNumber("100")).toBe(100);
      expect(parseNumber("100.50")).toBe(100.5);
      expect(parseNumber("1,000")).toBe(1000);
    });

    it("returns null for invalid numbers", () => {
      expect(parseNumber("")).toBeNull();
      expect(parseNumber("abc")).toBeNull();
    });
  });

  describe("Boolean Parsing", () => {
    it("parses valid booleans", () => {
      expect(parseBoolean("true")).toBe(true);
      expect(parseBoolean("yes")).toBe(true);
      expect(parseBoolean("1")).toBe(true);
      expect(parseBoolean("false")).toBe(false);
      expect(parseBoolean("no")).toBe(false);
    });
  });

  describe("COA Validation", () => {
    it("validates COA rows", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma as any).account.count.mockResolvedValue(0);
      (prisma as any).account.findMany.mockResolvedValue([]);

      const result = await validateCoaRows(
        { tenantId: "t-123", userId: "u-123" },
        [
          { originalRowNumber: 1, code: "1000", name: "Cash" },
          { originalRowNumber: 2, code: "", name: "Invalid" }, // Missing code
        ]
      );

      expect(result.supported).toBe(true);
      expect(result.valid).toHaveLength(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("returns supported:false when Account model missing", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma as any).account.count.mockRejectedValue(new Error("Model not found"));

      const result = await validateCoaRows(
        { tenantId: "t-123", userId: "u-123" },
        [{ originalRowNumber: 1, code: "1000", name: "Cash" }]
      );

      expect(result.supported).toBe(false);
      expect(result.message).toContain("Schema gap");
    });
  });

  describe("Vendor Validation", () => {
    it("validates vendor rows", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma as any).supplier.count.mockResolvedValue(0);
      (prisma as any).supplier.findMany.mockResolvedValue([]);

      const result = await validateVendorRows(
        { tenantId: "t-123", userId: "u-123" },
        [
          { originalRowNumber: 1, code: "SUPP-001", name: "Acme Corp", email: "acme@example.com" },
          { originalRowNumber: 2, code: "SUPP-002", name: "Invalid", email: "not-an-email" }, // Invalid email
        ]
      );

      expect(result.supported).toBe(true);
      expect(result.valid).toHaveLength(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Customer Validation", () => {
    it("returns supported:false (no Customer model)", async () => {
      const result = await validateCustomerRows(
        { tenantId: "t-123", userId: "u-123" },
        [{ originalRowNumber: 1, code: "CUST-001", name: "Customer" }]
      );

      expect(result.supported).toBe(false);
      expect(result.message).toContain("Schema gap");
    });
  });

  describe("Import Job Support", () => {
    it("returns supported:false (no ImportJob model)", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma as any).importJob = undefined;

      const result = await getImportSupport();

      expect(result.supported).toBe(false);
      expect(result.reason).toContain("Schema gap");
    });
  });
});

