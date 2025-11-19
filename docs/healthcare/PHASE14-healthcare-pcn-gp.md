Last updated: 2025-11-16

Purpose
- Document Phase 14 — HEALTHCARE / PCN / GP implementation on locked Prisma schema.
- Inventory existing healthcare-related models and what's available vs missing.

Who should read this
- Developers implementing healthcare/PCN/GP features.
- Future schema migration planners.

---

## Existing Models Inventory

### Available Models

**HR/Payroll (from Phase 3)**
- `Employee` (id, tenantId, empNo, firstName, lastName, email) — **Note: No role/department fields visible**
- `PaySchedule` (id, tenantId, name, frequency)
- `PayrollRun` (id, tenantId, scheduleId, periodStart, periodEnd, status)
- `Payslip` (id, tenantId, runId, employeeId, grossPay, netPay)
- `Allowance` (payslipId, name, amount)
- `Deduction` (payslipId, name, amount)

**Entity/Legal Entity**
- `Entity` (id, tenantId, name, currencyCode) — Could potentially represent a Practice/Clinic

**Missing Models**
- No `Practice` / `HealthcarePractice` / `Clinic` table
- No `Pcn` / `Network` table
- No `PracticePcn` join table
- No `RotaHeader` / `RotaShift` / `RotaAssignment` tables
- No `ArrsRole` / `ArrsAssignment` / `LocumAssignment` tables
- No `Claim` / `ArrsClaim` / `PcnClaim` / `ArrsReimbursement` tables
- No `Department` table (no way to distinguish healthcare departments)
- Employee model has no `role` or `departmentId` fields

---

## Feature Availability Matrix

| Feature | Available Now | Missing / Schema Gap |
|---------|---------------|----------------------|
| **Practice/PCN Models** | Entity model exists (could represent Practice), but no Practice-specific fields (code, address, PCN link). | No Practice table. No PCN table. No PracticePcn join table. Cannot create/update practices or PCNs. Will return 501 with schema-gap messages. |
| **ARRS + Locums** | Employee model exists, but no role/department fields to identify ARRS staff. Payslip data exists for cost aggregation. | No ArrsRole table. No ArrsAssignment table. No LocumAssignment table. Cannot distinguish ARRS staff from other employees. Will return supported:false with clear gap messages. |
| **Rota → Payroll → Claims** | PayrollRun/Payslip exist for payroll data. Employee exists for staff reference. | No RotaHeader/RotaShift/RotaAssignment tables. No Claim/ArrsClaim tables. Cannot link rota shifts to payroll or claims. Will return supported:false for rota operations. Claims preview will attempt to derive from payroll data only (limited). |
| **Healthcare Reporting Pack** | Can aggregate payroll costs by employee. Can count employees. Entity model could represent practices (limited). | Cannot report by Practice/PCN (no models). Cannot report rota coverage (no rota models). Cannot report claims (no claim models). Reporting will be limited to payroll cost summaries where possible. |

---

## Phase 14 Implementation Plan

### What Phase 14 Will Do

1. **Practice + PCN Master Data**
   - `listPractices` — returns empty list + schema-gap message (no Practice table)
   - `getPractice` — returns 404 or schema-gap message
   - `createPractice` / `updatePractice` — returns 501 (no Practice table)
   - `listPcns` — returns empty list + schema-gap message (no Pcn table)
   - `getPcn` — returns 404 or schema-gap message

2. **ARRS + Locums Bridge**
   - `listHealthcareStaff` — attempts to list all employees (no way to filter by healthcare role)
   - `getArrsEligibleStaff` — returns supported:false (no ARRS indicators)
   - `buildArrsCostSummary` — attempts to aggregate payroll costs, but cannot filter by ARRS role (returns supported:false with explanation)

3. **Rota → Payroll → Claims Pipeline**
   - `listRotas` — returns supported:false (no rota models)
   - `listShiftsForRota` — returns supported:false (no rota models)
   - `listClaims` — returns supported:false (no claim models)
   - `buildClaimsPreview` — attempts to derive from PayrollRun/Payslip data only (very limited, returns supported:false with explanation)

4. **Healthcare Reporting Pack**
   - `getHealthcareOverview` — returns basic counts (employees, payroll runs) with schema-gap notes
   - `getPracticeReport` — returns supported:false (no Practice model)
   - `getPcnReport` — returns supported:false (no Pcn model)

### What Remains Blocked for Future Schema Migration

- Practice + PCN tables with proper relationships
- RotaHeader + RotaShift + RotaAssignment tables
- ArrsRole + ArrsAssignment + LocumAssignment tables
- Claim + ArrsClaim + ArrsReimbursement tables
- Department table + Employee.departmentId field
- Employee.role field (to distinguish clinical roles)
- PracticePcn join table for PCN membership

---

## Phase 14 Constraints

- **Read-only**: All operations are read-only (no writes to business entities)
- **Tenant-scoped**: All operations respect tenant boundaries
- **RBAC-guarded**: All endpoints enforce RBAC (ui:healthcare:view, ui:healthcare:admin)
- **Schema-safe**: No schema modifications; all gaps return 501 or supported:false with clear messages
- **No JSON/file stores**: All data comes from existing DB tables only

