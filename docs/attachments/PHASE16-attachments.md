Last updated: 2025-11-16

Purpose
- Document Phase 16 — DOCUMENT / ATTACHMENT SERVICE implementation for Task 8.
- Inventory existing attachment capabilities and document schema gaps.

Who should read this
- Developers implementing attachment/file upload features.
- Future schema migration planners.

---

## Schema Scan Results

### Existing Models

**AuditLog** (Available)
- `id`, `tenantId`, `actorId`, `action`, `target`, `at`, `data` (Json)
- Can be used for attachment operation audit logging

**Missing Models**
- **No `Attachment` model** — No attachment/file/document table exists in the schema
- **No `AttachmentVersion` model** — No versioning support
- **No `AttachmentScan` model** — No virus scan result storage

### Existing Attachment APIs

**None Found**
- No existing file upload endpoints
- No attachment management APIs
- No document storage services

---

## Schema Gaps

### Critical Gaps (Block Full Implementation)

1. **No Attachment Model**
   - Missing fields: `id`, `tenantId`, `entityType`, `entityId`, `version`, `filename`, `mimeType`, `size`, `storageKey`, `checksum`, `deletedAt`, `createdBy`, `createdAt`, `updatedAt`
   - Impact: Cannot persist attachment metadata in database

2. **No Version Field**
   - Cannot track attachment versions without a version field
   - Impact: Versioning logic must be implemented in application code only (no DB persistence)

3. **No Checksum Field**
   - Cannot store file integrity checksums
   - Impact: Checksum validation must be computed on-the-fly

4. **No Soft Delete Support**
   - No `deletedAt` or `isDeleted` field
   - Impact: Cannot soft-delete attachments; must return 501 for delete operations

5. **No Status Field**
   - Cannot track attachment status (e.g., "uploading", "scanning", "quarantined", "ready")
   - Impact: Cannot implement optimistic upload flow with status tracking

6. **No Virus Scan Result Storage**
   - Cannot persist scan results in database
   - Impact: Scan results must be handled in-memory or via external logging only

### Available Features

- **AuditLog**: Can log attachment operations (create, delete, download) with metadata
- **Tenant Scoping**: All operations respect existing tenant patterns
- **RBAC**: Can enforce permissions using existing RBAC matrix

---

## Phase 16 Implementation Plan

### What Phase 16 Will Implement

1. **Attachment Configuration**
   - Environment-based config (`NEXA_ATTACHMENTS_ENABLED`, S3 bucket, region, max size, allowed MIME types)
   - Returns `enabled:false` when not configured

2. **S3 Client Module**
   - AWS SDK v3 integration for S3 operations
   - Tenant-scoped object key generation: `tenants/{tenantId}/{entityType}/{entityId}/v{version}/{filename}`
   - Pre-signed URL generation for upload/download

3. **Attachment Service (Schema-Safe Scaffolding)**
   - `getAttachmentSupport()` — Returns `supported:false` when Attachment model is missing
   - `listAttachmentsForTarget()` — Returns empty list + `supported:false` when model missing
   - `createAttachmentRecord()` — Returns `supported:false` or throws 501 when model missing
   - `markAttachmentDeleted()` — Returns 501 when model missing (no soft-delete support)
   - All functions enforce tenant scoping and RBAC

4. **Pre-Signed URL Generation**
   - `getUploadUrl()` — Validates config, RBAC, size, MIME type; generates S3 pre-signed PUT URL
   - `getDownloadUrl()` — Validates tenant + RBAC; generates S3 pre-signed GET URL
   - Returns 501 when Attachment model is missing

5. **Virus Scanning Stub**
   - `scanAttachmentObject()` — Stub implementation that returns `DISABLED` when not configured
   - No external scanner calls (future integration point)
   - Returns `supported:false` when scan config is missing

6. **Attachment APIs**
   - `/api/attachments/list` — Lists attachments for entity (returns `supported:false` when model missing)
   - `/api/attachments/upload-url` — Generates pre-signed upload URL (returns 501 when model missing)
   - `/api/attachments/download-url` — Generates pre-signed download URL (returns 501 when model missing)
   - `/api/attachments/delete` — Soft-deletes attachment (returns 501 when model missing)

7. **RBAC Permissions**
   - `ui:attachments:view` — View attachments
   - `ui:attachments:edit` — Upload/delete attachments
   - Mapped to ADMIN, MANAGER roles

8. **UI Components**
   - `AttachmentPanel` — Reusable component for displaying/managing attachments
   - `/attachments` — Attachments hub page
   - Integration into existing entity detail pages (invoices, employees)

9. **Audit Logging**
   - Logs attachment operations to `AuditLog` table:
     - `ATTACHMENT_CREATED` — On upload
     - `ATTACHMENT_DELETED` — On delete
     - `ATTACHMENT_DOWNLOADED` — On download (debug-level)

### What Returns 501 / supported:false

- **All attachment operations** when `Attachment` model is missing:
  - `listAttachmentsForTarget()` — Returns `[]` with `supported:false`
  - `createAttachmentRecord()` — Returns 501 with "schema gap: no Attachment model"
  - `markAttachmentDeleted()` — Returns 501 with "schema gap: no Attachment model or deletedAt field"
  - `getUploadUrl()` — Returns 501 if Attachment model missing (cannot create DB record)
  - `getDownloadUrl()` — Returns 404/501 if Attachment model missing (cannot load record)

- **Virus scanning** when not configured:
  - `scanAttachmentObject()` — Returns `{ status: DISABLED }` when `NEXA_VIRUSSCAN_ENABLED=false`

---

## Write-Through Flow Decision

**Chosen Approach**: **Option B — Follow-up "complete" call**

**Rationale**:
- No `status` field exists in schema to track "uploading" state
- Creating DB record before upload risks orphaned records if upload fails
- Pre-signed URL generation does not require DB record
- Client must call `/api/attachments/complete` after successful upload to create DB record

**Flow**:
1. Client calls `/api/attachments/upload-url` with metadata
2. Server validates config, RBAC, size, MIME type
3. Server computes next version and generates pre-signed URL
4. Server returns pre-signed URL + metadata (no DB record yet)
5. Client uploads file directly to S3 using pre-signed URL
6. Client calls `/api/attachments/complete` with upload confirmation
7. Server creates DB record (if Attachment model exists) or returns 501

**Limitation**: If Attachment model is missing, step 7 returns 501 and no DB record is created. File exists in S3 but is not tracked in database.

---

## Configuration

### Environment Variables

**Required** (when `NEXA_ATTACHMENTS_ENABLED=true`):
- `NEXA_ATTACHMENTS_S3_BUCKET` — S3 bucket name
- `NEXA_ATTACHMENTS_S3_REGION` — AWS region (e.g., `eu-west-2`)
- `AWS_ACCESS_KEY_ID` — AWS access key (or use IAM role)
- `AWS_SECRET_ACCESS_KEY` — AWS secret key (or use IAM role)

**Optional**:
- `NEXA_ATTACHMENTS_ENABLED` — Default `false` (must be explicitly enabled)
- `NEXA_ATTACHMENTS_MAX_SIZE_MB` — Default `20` MB
- `NEXA_ATTACHMENTS_ALLOWED_MIME` — Comma-separated list (default: safe whitelist of common document/image types)
- `NEXA_VIRUSSCAN_ENABLED` — Default `false`
- `NEXA_VIRUSSCAN_ENDPOINT` — Virus scan API endpoint (future)

---

## How to Enable

1. **Set Environment Variables**:
   ```bash
   export NEXA_ATTACHMENTS_ENABLED=true
   export NEXA_ATTACHMENTS_S3_BUCKET=nexa-attachments-prod
   export NEXA_ATTACHMENTS_S3_REGION=eu-west-2
   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   ```

2. **Install AWS SDK** (if not already present):
   ```bash
   pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

3. **Configure S3 Bucket**:
   - Create S3 bucket with appropriate CORS policy
   - Set bucket policy to allow pre-signed URL uploads/downloads
   - Enable versioning if desired (for S3-level versioning)

4. **Note**: Even with S3 configured, attachment operations will return `supported:false` or 501 until the `Attachment` model is added to the schema.

---

## Telemetry and Logging

### Audit Log Events

All attachment operations log to `AuditLog` table:

- **ATTACHMENT_CREATED**: `{ tenantId, entityType, entityId, attachmentId, filename, size, userId }`
- **ATTACHMENT_DELETED**: `{ tenantId, entityType, entityId, attachmentId, filename, userId, reason }`
- **ATTACHMENT_DOWNLOADED**: `{ tenantId, attachmentId, userId }` (debug-level only)

### Telemetry

Attachment operations also log to telemetry (Sentry/metrics) with non-PII payload:
- `attachment.upload` — On upload completion
- `attachment.delete` — On delete
- `attachment.download` — On download (sampled, not all downloads)

---

## Future Schema Migration Requirements

To enable full attachment functionality, add the following to `prisma/schema.prisma`:

```prisma
model Attachment {
  id          String    @id @default(cuid())
  tenantId    String
  entityType  String    // e.g., "CustomerInvoice", "Employee"
  entityId    String
  version     Int       @default(1)
  filename    String
  mimeType    String
  size        Int       // bytes
  storageKey  String    // S3 object key
  checksum    String?   // SHA256 hash
  deletedAt   DateTime?
  createdBy   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([tenantId, entityType, entityId])
  @@index([tenantId, storageKey])
  @@unique([tenantId, entityType, entityId, version, filename])
}
```

---

## Constraints

- **Schema locked**: No changes to `apps/web/prisma/schema.prisma` or Prisma migrations
- **No JSON/file stores**: All metadata must come from Postgres via Prisma (when Attachment model exists)
- **S3-only storage**: Files stored in S3, never in application filesystem
- **Pre-signed URLs only**: Files never stream through Nexa's Node process
- **Tenant-scoped**: All operations respect existing tenant patterns
- **RBAC-preserved**: All operations respect existing RBAC patterns
- **Nexa shell unchanged**: Logo behavior unchanged

