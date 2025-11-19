import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAttachmentSupport, buildObjectKey, getAttachmentConfig } from "../service";
import { getUploadUrl, getDownloadUrl } from "../presign";
import { scanAttachmentObject, VirusScanResultStatus } from "../virusScan";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    attachment: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

// Mock S3 client
vi.mock("../s3Client", async () => {
  const actual = await vi.importActual("../s3Client");
  return {
    ...actual,
    getS3Client: vi.fn(() => ({
      send: vi.fn(),
    })),
  };
});

// Mock AWS SDK
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(() => Promise.resolve("https://s3.example.com/signed-url")),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
}));

describe("Attachment Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env vars
    delete process.env.NEXA_ATTACHMENTS_ENABLED;
    delete process.env.NEXA_VIRUSSCAN_ENABLED;
  });

  describe("getAttachmentSupport", () => {
    it("returns supported:false when attachments not enabled", async () => {
      const result = await getAttachmentSupport();
      expect(result.supported).toBe(false);
      expect(result.reason).toContain("not enabled");
    });

    it("returns supported:false when Attachment model missing", async () => {
      process.env.NEXA_ATTACHMENTS_ENABLED = "true";
      process.env.NEXA_ATTACHMENTS_S3_BUCKET = "test-bucket";
      process.env.NEXA_ATTACHMENTS_S3_REGION = "eu-west-2";

      const result = await getAttachmentSupport();
      expect(result.supported).toBe(false);
      expect(result.reason).toContain("Schema gap");
    });
  });

  describe("buildObjectKey", () => {
    it("generates tenant-prefixed keys", () => {
      const key = buildObjectKey({
        tenantId: "t-123",
        entityType: "CustomerInvoice",
        entityId: "inv-001",
        version: 1,
        filename: "invoice.pdf",
      });

      expect(key).toBe("tenants/t-123/CustomerInvoice/inv-001/v1/invoice.pdf");
    });

    it("sanitizes filename", () => {
      const key = buildObjectKey({
        tenantId: "t-123",
        entityType: "Employee",
        entityId: "emp-001",
        version: 2,
        filename: "../../etc/passwd",
      });

      expect(key).not.toContain("../");
      expect(key).toContain("passwd");
    });
  });

  describe("getUploadUrl", () => {
    it("returns supported:false when attachments disabled", async () => {
      const result = await getUploadUrl(
        { tenantId: "t-123", userId: "u-123" },
        { entityType: "CustomerInvoice", entityId: "inv-001" },
        "test.pdf",
        "application/pdf",
        1024
      );

      expect(result.supported).toBe(false);
      expect(result.message).toContain("not enabled");
    });

    it("validates file size", async () => {
      process.env.NEXA_ATTACHMENTS_ENABLED = "true";
      process.env.NEXA_ATTACHMENTS_S3_BUCKET = "test-bucket";
      process.env.NEXA_ATTACHMENTS_S3_REGION = "eu-west-2";
      process.env.NEXA_ATTACHMENTS_MAX_SIZE_MB = "1";

      const result = await getUploadUrl(
        { tenantId: "t-123", userId: "u-123" },
        { entityType: "CustomerInvoice", entityId: "inv-001" },
        "test.pdf",
        "application/pdf",
        2 * 1024 * 1024 // 2 MB, exceeds 1 MB limit
      );

      expect(result.supported).toBe(false);
      expect(result.message).toContain("exceeds maximum");
    });

    it("validates MIME type", async () => {
      process.env.NEXA_ATTACHMENTS_ENABLED = "true";
      process.env.NEXA_ATTACHMENTS_S3_BUCKET = "test-bucket";
      process.env.NEXA_ATTACHMENTS_S3_REGION = "eu-west-2";

      const result = await getUploadUrl(
        { tenantId: "t-123", userId: "u-123" },
        { entityType: "CustomerInvoice", entityId: "inv-001" },
        "test.exe",
        "application/x-executable",
        1024
      );

      expect(result.supported).toBe(false);
      expect(result.message).toContain("not allowed");
    });
  });

  describe("getDownloadUrl", () => {
    it("returns supported:false when attachments disabled", async () => {
      const result = await getDownloadUrl({ tenantId: "t-123", userId: "u-123" }, "att-123");

      expect(result.supported).toBe(false);
      expect(result.message).toContain("not enabled");
    });
  });

  describe("scanAttachmentObject", () => {
    it("returns DISABLED when virus scan not configured", async () => {
      const result = await scanAttachmentObject("test-key");

      expect(result.status).toBe(VirusScanResultStatus.DISABLED);
      expect(result.details).toContain("not configured");
    });

    it("returns DISABLED when endpoint not set", async () => {
      process.env.NEXA_VIRUSSCAN_ENABLED = "true";

      const result = await scanAttachmentObject("test-key");

      expect(result.status).toBe(VirusScanResultStatus.DISABLED);
      expect(result.details).toContain("endpoint not configured");
    });
  });
});

