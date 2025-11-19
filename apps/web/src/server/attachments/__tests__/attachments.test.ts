/**
 * Attachment Service Tests
 * 
 * Tests for attachment CRUD operations, S3 integration, and versioning
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAttachmentSupport,
  listAttachmentsForTarget,
  createAttachmentRecord,
  markAttachmentDeleted,
  getAttachment,
} from "../service";
import { getUploadUrl, getDownloadUrl } from "../presign";
import { deleteAttachmentFromS3 } from "../delete";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    attachment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

// Mock S3
vi.mock("../s3Client", () => ({
  getS3Client: vi.fn(),
  buildObjectKey: vi.fn((params) => 
    `tenants/${params.tenantId}/${params.entityType}/${params.entityId}/v${params.version}/${params.filename}`
  ),
}));

// Mock config
vi.mock("../config", () => ({
  getAttachmentConfig: vi.fn(() => ({
    enabled: true,
    s3Bucket: "test-bucket",
    s3Region: "eu-west-2",
    maxSizeMB: 20,
    allowedMimeTypes: ["application/pdf", "image/jpeg"],
  })),
}));

describe("Attachment Service", () => {
  const tenantContext = {
    tenantId: "test-tenant",
    userId: "test-user",
  };

  const target = {
    entityType: "CustomerInvoice",
    entityId: "inv-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAttachmentSupport", () => {
    it("should return supported when enabled", async () => {
      const result = await getAttachmentSupport();
      expect(result.supported).toBe(true);
    });
  });

  describe("listAttachmentsForTarget", () => {
    it("should list attachments for target entity", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.attachment.findMany as any).mockResolvedValue([
        {
          id: "att-1",
          tenantId: tenantContext.tenantId,
          entityType: target.entityType,
          entityId: target.entityId,
          version: 1,
          filename: "test.pdf",
          mimeType: "application/pdf",
          size: 1024,
          checksum: null,
          deletedAt: null,
          uploadedBy: tenantContext.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await listAttachmentsForTarget(tenantContext, target);
      expect(result.supported).toBe(true);
      expect(result.attachments.length).toBe(1);
      expect(result.attachments[0].filename).toBe("test.pdf");
    });

    it("should exclude deleted attachments", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.attachment.findMany as any).mockResolvedValue([]);

      const result = await listAttachmentsForTarget(tenantContext, target);
      expect(result.supported).toBe(true);
      expect(result.attachments.length).toBe(0);
    });
  });

  describe("createAttachmentRecord", () => {
    it("should create attachment record", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.attachment.aggregate as any).mockResolvedValue({ _max: { version: 0 } });
      (prisma.attachment.create as any).mockResolvedValue({
        id: "att-1",
        tenantId: tenantContext.tenantId,
        entityType: target.entityType,
        entityId: target.entityId,
        version: 1,
        filename: "encrypted-filename",
        mimeType: "application/pdf",
        size: 1024,
        checksum: null,
        deletedAt: null,
        uploadedBy: tenantContext.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createAttachmentRecord(tenantContext, target, {
        filename: "test.pdf",
        mimeType: "application/pdf",
        size: 1024,
        storageKey: "tenants/test-tenant/CustomerInvoice/inv-123/v1/test.pdf",
      });

      expect(result.supported).toBe(true);
      expect(result.attachment).toBeDefined();
      expect(result.attachment?.filename).toBe("test.pdf");
    });

    it("should increment version for same entity", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.attachment.aggregate as any).mockResolvedValue({ _max: { version: 2 } });
      (prisma.attachment.create as any).mockResolvedValue({
        id: "att-2",
        version: 3,
        // ... other fields
      });

      const result = await createAttachmentRecord(tenantContext, target, {
        filename: "test-v2.pdf",
        mimeType: "application/pdf",
        size: 2048,
        storageKey: "tenants/test-tenant/CustomerInvoice/inv-123/v3/test-v2.pdf",
      });

      expect(result.supported).toBe(true);
      expect(result.attachment?.version).toBe(3);
    });
  });

  describe("markAttachmentDeleted", () => {
    it("should soft delete attachment", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.attachment.findFirst as any).mockResolvedValue({
        id: "att-1",
        tenantId: tenantContext.tenantId,
        entityType: target.entityType,
        entityId: target.entityId,
      });
      (prisma.attachment.update as any).mockResolvedValue({
        id: "att-1",
        deletedAt: new Date(),
        status: "deleted",
      });

      const result = await markAttachmentDeleted(tenantContext, "att-1", "test reason");
      expect(result.supported).toBe(true);
    });

    it("should return error if attachment not found", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.attachment.findFirst as any).mockResolvedValue(null);

      const result = await markAttachmentDeleted(tenantContext, "att-999", "test reason");
      expect(result.supported).toBe(false);
      expect(result.message).toContain("not found");
    });
  });

  describe("getAttachment", () => {
    it("should get attachment by ID", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.attachment.findFirst as any).mockResolvedValue({
        id: "att-1",
        tenantId: tenantContext.tenantId,
        entityType: target.entityType,
        entityId: target.entityId,
        version: 1,
        filename: "encrypted-filename",
        mimeType: "application/pdf",
        size: 1024,
        checksum: null,
        deletedAt: null,
        uploadedBy: tenantContext.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getAttachment(tenantContext, "att-1");
      expect(result.supported).toBe(true);
      expect(result.attachment).toBeDefined();
    });

    it("should return null if attachment not found", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.attachment.findFirst as any).mockResolvedValue(null);

      const result = await getAttachment(tenantContext, "att-999");
      expect(result.supported).toBe(true);
      expect(result.attachment).toBeNull();
    });
  });
});

describe("Attachment S3 Operations", () => {
  const tenantContext = {
    tenantId: "test-tenant",
    userId: "test-user",
  };

  describe("getUploadUrl", () => {
    it("should generate upload URL with correct storage key", async () => {
      const { getNextVersion } = await import("../service");
      vi.mocked(getNextVersion).mockResolvedValue(1);

      const result = await getUploadUrl(
        tenantContext,
        { entityType: "CustomerInvoice", entityId: "inv-123" },
        "test.pdf",
        "application/pdf",
        1024
      );

      expect(result.supported).toBe(true);
      expect(result.storageKey).toContain("tenants/test-tenant/CustomerInvoice/inv-123/v1/test.pdf");
      expect(result.uploadUrl).toBeDefined();
    });

    it("should validate file size", async () => {
      const result = await getUploadUrl(
        tenantContext,
        { entityType: "CustomerInvoice", entityId: "inv-123" },
        "large.pdf",
        "application/pdf",
        25 * 1024 * 1024 // 25 MB, exceeds 20 MB limit
      );

      expect(result.supported).toBe(false);
      expect(result.message).toContain("size");
    });

    it("should validate MIME type", async () => {
      const result = await getUploadUrl(
        tenantContext,
        { entityType: "CustomerInvoice", entityId: "inv-123" },
        "script.exe",
        "application/x-msdownload",
        1024
      );

      expect(result.supported).toBe(false);
      expect(result.message).toContain("MIME");
    });
  });

  describe("getDownloadUrl", () => {
    it("should generate download URL", async () => {
      const { getAttachment } = await import("../service");
      vi.mocked(getAttachment).mockResolvedValue({
        supported: true,
        attachment: {
          id: "att-1",
          tenantId: tenantContext.tenantId,
          entityType: "CustomerInvoice",
          entityId: "inv-123",
          version: 1,
          filename: "test.pdf",
          mimeType: "application/pdf",
          size: 1024,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await getDownloadUrl(tenantContext, "att-1");
      expect(result.supported).toBe(true);
      expect(result.downloadUrl).toBeDefined();
      expect(result.filename).toBe("test.pdf");
    });
  });

  describe("deleteAttachmentFromS3", () => {
    it("should delete file from S3", async () => {
      const { getAttachment } = await import("../service");
      vi.mocked(getAttachment).mockResolvedValue({
        supported: true,
        attachment: {
          id: "att-1",
          tenantId: tenantContext.tenantId,
          entityType: "CustomerInvoice",
          entityId: "inv-123",
          version: 1,
          filename: "test.pdf",
          mimeType: "application/pdf",
          size: 1024,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const s3Client = await import("@aws-sdk/client-s3");
      const mockSend = vi.fn().mockResolvedValue({});
      vi.mocked(await import("../s3Client")).getS3Client.mockReturnValue({
        send: mockSend,
      } as any);

      const result = await deleteAttachmentFromS3(tenantContext, "att-1");
      expect(result.supported).toBe(true);
      expect(result.deleted).toBe(true);
    });
  });
});

