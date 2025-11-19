# Phase 19 — BYOK + Data Residency

**Status**: ✅ Complete (Task 8 Gap Closure)  
**Last Updated**: 2025-01-18

---

## Overview

Phase 19 implements per-tenant encryption keys (BYOK), field-level encryption, region-based data residency guards, and backup policy compliance checking using the `TenantKey`, `TenantConfig`, `BackupPolicy`, and `BackupRun` Prisma models.

---

## Implementation

### BYOK Provider (`apps/web/src/server/security/byokProvider.ts`)

**Status**: ✅ Fully DB-backed

- `getTenantKey(tenantId)` — Retrieves active key from `TenantKey` model (latest version)
- `getTenantRegion(tenantId)` — Reads region from `TenantConfig.config.region` JSON field
- `listTenantKeys(tenantId)` — Lists all keys for a tenant
- `createTenantKey(tenantId, params)` — Creates new key record
- `rotateTenantKey(tenantId, newKeyMaterial, actorId)` — Rotates key (marks old, creates new) and emits event

**Features**:
- Version tracking for key rotation
- Event emission on key rotation
- Audit logging for key operations
- Returns `supported:false` only when BYOK is disabled or no key configured (runtime conditions, not schema gaps)

### BYOK Crypto (`apps/web/src/server/security/byokCrypto.ts`)

**Status**: ✅ Fully DB-backed

- `encryptForTenant(tenantId, plaintext)` — Encrypts using AES-256-GCM with key from `TenantKey.keyMaterial`
- `decryptForTenant(tenantId, ciphertext, metadata)` — Decrypts using stored key material

**Features**:
- Real encryption/decryption using Node.js crypto
- AES-256-GCM with IV and auth tag
- Base64 encoding for storage
- Backward compatibility: returns plaintext if BYOK disabled or decryption fails
- Error handling with observability integration

### BYOK Hooks (`apps/web/src/server/security/byokHooks.ts`)

**Status**: ✅ Fully DB-backed

Helper functions for field-level encryption:
- `maybeEncryptEmail` / `maybeDecryptEmail`
- `maybeEncryptPhone` / `maybeDecryptPhone`
- `maybeEncryptBankAccount` / `maybeDecryptBankAccount`
- `maybeEncryptIBAN` / `maybeDecryptIBAN`
- `maybeEncryptSortCode` / `maybeDecryptSortCode`
- `maybeEncryptNI` / `maybeDecryptNI`
- `maybeEncryptAddress` / `maybeDecryptAddress`
- `maybeEncryptFilename` / `maybeDecryptFilename`

**Behavior**: Returns plaintext when BYOK disabled or no key exists (backward compatible).

### Data Residency (`apps/web/src/server/security/dataResidency.ts`)

**Status**: ✅ Fully DB-backed

- `getTenantRegion(tenantId)` — Reads from `TenantConfig.config.region`
- `assertResidencyAllowed(tenantId, requiredRegion, module?)` — Validates tenant region against required regions
- `getAllowedRegionsForModule(module)` — Returns hard-coded module → region mapping

**Features**:
- Region validation with clear error messages
- Module-specific region constraints
- Returns "UNKNOWN" only when region not configured (config missing, not schema gap)

### Backup Policy Check (`scripts/backup/backup-check-phase19.ts`)

**Status**: ✅ Fully DB-backed

- `generateBackupReport(tenantId?)` — Validates backup compliance using `BackupPolicy` and `BackupRun` models

**Checks**:
- Policy configuration existence
- Retention period compliance (region-specific)
- Encryption status
- Last backup age vs frequency
- Last backup status

**Output**: Structured JSON + human-readable report with compliance flag.

### API Routes

**Status**: ✅ Fully DB-backed

#### `/api/security/byok/status` (GET)
- **RBAC**: `ui:admin:super` only
- **Returns**: BYOK enabled status, provider, active key info, keys summary
- **No schema gap messages**: Returns "configured: false" if no key exists

#### `/api/security/byok/rotate` (POST)
- **RBAC**: `ui:admin:super` only
- **Body**: `{ tenantId?, newKeyMaterial? }` (generates if not provided)
- **Returns**: Old and new key info
- **Emits**: `security.byok.key.rotated` event

#### `/api/security/residency/status` (GET)
- **RBAC**: `ui:admin:super` only
- **Returns**: Tenant region, allowed regions per module, module status, enforcement flag
- **No schema gap messages**: Returns "region not configured" if UNKNOWN

#### `/api/security/residency/update` (POST)
- **RBAC**: `ui:admin:super` only
- **Body**: `{ tenantId?, region }`
- **Updates**: `TenantConfig.config.region` JSON field
- **Audit**: Logs region update

---

## Schema

### TenantKey Model

```prisma
model TenantKey {
  id          String   @id @default(cuid())
  tenantId    String
  version     Int      @default(1)
  keyMaterial Bytes
  algorithm   String   @default("AES-256-GCM")
  rotatedAt   DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId, version])
}
```

### TenantConfig Model

```prisma
model TenantConfig {
  id        String   @id @default(cuid())
  tenantId  String   @unique
  locale    String?  @default("en-GB")
  timezone  String?  @default("Europe/London")
  currency  String?  @default("GBP")
  config    Json? // { region: "UK" | "EU" | "GCC" | "US", ... }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
}
```

### BackupPolicy Model

```prisma
model BackupPolicy {
  id            String      @id @default(cuid())
  tenantId      String
  frequency     String // daily, weekly, monthly
  retentionDays Int         @default(30)
  enabled       Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  BackupRun     BackupRun[]

  @@index([tenantId])
}
```

### BackupRun Model

```prisma
model BackupRun {
  id          String        @id @default(cuid())
  tenantId    String
  policyId    String?
  status      String // success, failed
  sizeBytes   Int?
  startedAt   DateTime
  completedAt DateTime?
  error       String?
  createdAt   DateTime      @default(now())
  policy      BackupPolicy? @relation(fields: [policyId], references: [id])

  @@index([tenantId, policyId, startedAt])
}
```

---

## Task 8 Gap Closure

### Removed
- ✅ All `supported:false` schema gap stubs
- ✅ All 501 status codes in BYOK/residency API routes
- ✅ All "schema gap" messages in BYOK/residency code paths

### Implemented
- ✅ Full DB-backed key management using `TenantKey` model
- ✅ Real encryption/decryption using AES-256-GCM
- ✅ Region detection from `TenantConfig.config.region`
- ✅ Residency guards with module-specific constraints
- ✅ Backup policy compliance checking using `BackupPolicy`/`BackupRun`
- ✅ Key rotation with event emission
- ✅ RBAC protection on all admin APIs
- ✅ Audit logging for key and region operations

### Runtime Conditions (Not Schema Gaps)

The following return `supported:false` but are legitimate runtime conditions:
- BYOK disabled (`NEXA_BYOK_ENABLED=false`)
- No provider configured (`NEXA_BYOK_PROVIDER=none`)
- No key configured for tenant (key not created yet)
- Region not configured (region not set in TenantConfig)

These are **not** schema gaps — they are configuration states.

---

## Field-Level Encryption

### Encrypted Fields

The following fields are encrypted when BYOK is enabled and a key exists:

**Employee** (`Employee` model):
- `email` — Email addresses
- `phone` — Phone numbers (if field exists)

**Attachments** (`Attachment` model):
- `filename` — Filenames that may contain PII

**Banking** (future):
- Bank account numbers, IBANs, sort codes

**Healthcare** (future):
- Patient names, addresses, medical record numbers

### Encryption Algorithm

- **Algorithm**: AES-256-GCM
- **Key Material**: Stored in `TenantKey.keyMaterial` (Bytes)
- **IV**: 12-byte random IV per encryption
- **Auth Tag**: 16-byte GCM auth tag
- **Storage**: Base64-encoded (IV + authTag + ciphertext)

---

## Data Residency

### Region Detection

1. Read from `TenantConfig.config.region` JSON field
2. Fallback to `NEXA_DEFAULT_REGION` environment variable
3. Return "UNKNOWN" if neither configured

### Module Region Constraints

| Module | Allowed Regions |
|--------|----------------|
| Finance | UK, EU, GCC |
| HR | UK, EU |
| Payroll | UK, EU |
| Healthcare | UK, EU |
| Tax | UK, EU |
| Banking | UK, EU, GCC |
| POS | UK, EU, GCC |
| Analytics | UK, EU, GCC |
| AI | UK, EU, GCC |

### Enforcement

- `assertResidencyAllowed()` checks tenant region against module requirements
- Returns `allowed: false` with clear reason if region mismatch
- Services should check residency before sensitive operations

---

## Backup Compliance

### Required Retention by Region

- **UK**: 30 days (GDPR compliance)
- **EU**: 30 days (GDPR compliance)
- **GCC**: 90 days (local regulations)
- **US**: 30 days (default)

### Compliance Checks

The backup check script validates:
- Policy exists and is enabled
- Retention meets region requirements
- Encryption is enabled
- Last backup age vs frequency
- Last backup status

---

## Usage Examples

### Encrypt Employee Email

```typescript
import { maybeEncryptEmail } from "@/server/security/byokHooks";

const encryptedEmail = await maybeEncryptEmail(tenantId, employee.email);
// Returns encrypted value if BYOK enabled and key exists, otherwise returns plaintext
```

### Check Residency

```typescript
import { assertResidencyAllowed } from "@/server/security/dataResidency";

const guard = await assertResidencyAllowed(tenantId, ["UK", "EU"], "healthcare");
if (!guard.allowed) {
  throw new Error(`Operation not allowed: ${guard.reason}`);
}
```

### Rotate Key

```typescript
import { rotateTenantKey } from "@/server/security/byokProvider";
import { randomBytes } from "crypto";

const newKeyMaterial = randomBytes(32);
const result = await rotateTenantKey(tenantId, newKeyMaterial, actorId);
// Creates new key version, emits event, logs audit
```

---

## Notes

- Encryption is backward compatible: existing plaintext data continues to work
- Decryption attempts plaintext fallback if decryption fails (for backward compatibility)
- Key rotation creates new version; old keys remain for decrypting old data
- Region updates require super-admin permissions
- Backup compliance is read-only (does not execute backups)
