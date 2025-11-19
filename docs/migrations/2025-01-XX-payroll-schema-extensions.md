# Payroll Schema Extensions - Migration Instructions

**Last updated**: 2025-01-XX  
**Status**: Required for full A1 HR/Payroll functionality

---

## Purpose

This document provides migration instructions for extending the Employee and related models to support full UK PAYE/NI/Pension payroll calculations.

---

## Required Schema Changes

### 1. EmploymentContract Model

Add to `prisma/schema.prisma`:

```prisma
model EmploymentContract {
  id            String    @id @default(cuid())
  tenantId     String
  employeeId   String
  type          String    @default("salary") // salary, hourly
  baseAnnual    Decimal?  // Annual salary in pounds
  baseMinor      Int?      // Annual salary in pence (alternative)
  hourlyRate     Decimal?  // Hourly rate if type=hourly
  taxCode        String?   // e.g., "1257L", "BR", "K123"
  niCategory     String?   @default("A") // A, B, C, H, J, M, Z
  nino           String?   // National Insurance Number
  pensionSchemeId String?
  pensionOptOut  Boolean   @default(false)
  studentLoan     Boolean   @default(false)
  hmrcPayrollId  String?   // HMRC payroll ID
  startDate      DateTime
  endDate        DateTime?
  status         String    @default("active") // active, terminated
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  employee       Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([tenantId, employeeId])
  @@index([tenantId, status])
  @@index([tenantId, startDate, endDate])
}
```

### 2. PensionScheme Model

Add to `prisma/schema.prisma`:

```prisma
model PensionScheme {
  id            String    @id @default(cuid())
  tenantId      String
  code          String
  name          String
  employeeRate  Decimal   @default(0.05) // Default 5%
  employerRate  Decimal   @default(0.03) // Default 3%
  lowerEarnings Decimal   @default(6240) // Qualifying earnings threshold
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([tenantId, code])
  @@index([tenantId, active])
}
```

### 3. Extend Employee Model (Optional)

Alternatively, add fields directly to Employee model:

```prisma
model Employee {
  // ... existing fields ...
  taxCode        String?
  niCategory     String?   @default("A")
  nino           String?
  pensionSchemeId String?
  pensionOptOut  Boolean   @default(false)
  studentLoan     Boolean   @default(false)
  contracts      EmploymentContract[]
}
```

### 4. Extend EntityExt Model (for PAYE Reference)

Add PAYE reference to EntityExt:

```prisma
model EntityExt {
  // ... existing fields ...
  payeReference  String?   // PAYE reference for RTI submissions
}
```

---

## Migration Steps

### Step 1: Create Migration

```bash
cd apps/web
pnpm prisma migrate dev --name add_payroll_contracts
```

### Step 2: Review Generated Migration

Review the generated SQL in `prisma/migrations/XXXXXX_add_payroll_contracts/migration.sql` to ensure it matches your requirements.

### Step 3: Apply Migration

For development:
```bash
pnpm prisma migrate dev
```

For production (Neon/Postgres):
```bash
pnpm prisma migrate deploy
```

### Step 4: Generate Prisma Client

```bash
pnpm prisma generate
```

### Step 5: Seed Default Pension Schemes (Optional)

Create a seed script or run manually:

```typescript
// scripts/seed-pension-schemes.ts
import { prisma } from "@/lib/prisma";

async function seedPensionSchemes(tenantId: string) {
  await prisma.pensionScheme.upsert({
    where: { tenantId_code: { tenantId, code: "DEFAULT" } },
    update: {},
    create: {
      tenantId,
      code: "DEFAULT",
      name: "Default Pension Scheme",
      employeeRate: 0.05,
      employerRate: 0.03,
      lowerEarnings: 6240,
    },
  });
}
```

---

## Backfill Instructions

### Backfill Employment Contracts

For existing employees without contracts:

```sql
-- Create default contracts for existing employees
INSERT INTO "EmploymentContract" (
  id, "tenantId", "employeeId", type, "baseAnnual", 
  "taxCode", "niCategory", "startDate", status, 
  "createdAt", "updatedAt"
)
SELECT 
  gen_random_uuid(),
  e."tenantId",
  e.id,
  'salary',
  30000, -- Default £30k
  '1257L',
  'A',
  e."createdAt",
  'active',
  NOW(),
  NOW()
FROM "Employee" e
WHERE NOT EXISTS (
  SELECT 1 FROM "EmploymentContract" ec 
  WHERE ec."employeeId" = e.id AND ec.status = 'active'
);
```

---

## Verification

After migration:

1. Verify models exist:
   ```typescript
   const contract = await prisma.employmentContract.findFirst();
   const scheme = await prisma.pensionScheme.findFirst();
   ```

2. Test payroll calculation:
   ```typescript
   import { calculatePayrollRun } from "@/server/payroll/engine";
   const results = await calculatePayrollRun(tenantId, runId);
   ```

3. Verify journal posting:
   ```typescript
   import { postPayrollJournal } from "@/server/payroll/journals";
   const result = await postPayrollJournal(scope, runId, calculations);
   ```

---

## Notes

- The enhanced payroll engine (`@/server/payroll/engine.ts`) will work with defaults if contracts don't exist
- Falls back gracefully to basic mode if schema extensions not present
- All calculations use UK 2025 tax bands (update annually)
- RTI export format follows HMRC v1 specification

