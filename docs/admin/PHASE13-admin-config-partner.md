Last updated: 2025-11-16

Purpose
- Document Phase 13 — ADMIN + CONFIG + PARTNER implementation on locked Prisma schema.
- Inventory existing admin/config/partner models and what's available vs missing.

Who should read this
- Developers implementing admin/config/partner features.
- Future schema migration planners.

---

## Existing Models Inventory

### Available Models

**Tenant & User**
- `Tenant` (id, name, createdAt, updatedAt)
- `User` (id, email, role, tenantId, active, mfa_enabled, etc.)
- `Entity` (id, tenantId, name, currencyCode) — legal entity per tenant

**Finance/GL**
- `Account` (id, tenantId, code, type, name) — GL Chart of Accounts
- `JournalEntry` (tenantId, postedAt, lines)
- `JournalLine` (tenantId, accountId, debit, credit)

**Billing/Subscriptions**
- `Plan` (id, code, name, tier, active)
- `PlanAddon` (id, code, name, active)
- `Subscription` (id, tenantId, planId, status, currentPeriodStart, currentPeriodEnd, customerId)
- `UsageEvent` (tenantId, type, quantity, at, metadata)

**Missing Models**
- No `TenantConfig` table (no locale/currency/timezone persistence)
- No `Partner` table (no partner/partner-tenant mapping)
- No `CoATemplate` table (templates will be in-code only)
- No `IndustryPreset` table (presets will be in-code only)
- No `RevenueShare` table (calculation-only, no persistence)

---

## Existing Admin/Config/Partner Code

**Admin APIs**
- `/api/admin/users/create` — user creation
- `/api/admin/users/role` — role management

**Admin UI**
- No dedicated `/admin` pages under `app/(app)/admin/` yet

**Partner APIs**
- None

**Config APIs**
- None

---

## Feature Availability Matrix

| Feature | Available Now | Missing / Schema Gap |
|---------|---------------|----------------------|
| **CoA Templates** | Account model exists (tenantId, code, type, name). Can read existing accounts. | No CoATemplate table. Templates will be in-code catalogues. Apply may work if Account model supports safe inserts (tenantId + code unique constraint exists). |
| **Localisation** | Entity model has `currencyCode`. Tenant model exists but no locale/timezone fields. | No TenantConfig table. Can read Entity.currencyCode but cannot persist locale/timezone. Update will return 501. |
| **Partner Portal** | Subscription model has tenantId. User model has tenantId. | No Partner model. No PartnerTenant join table. Cannot list partners or map tenants to partners. Will return empty lists + schema-gap messages. |
| **Revenue-share Engine** | Subscription model exists with tenantId, planId, customerId. Can derive MRR from subscriptions. | No RevenueShare table. Calculation-only (no persistence). Can compute partner share % but cannot store results. |
| **Industry Presets** | Account model exists. Module enablement flags not in schema. | No IndustryPreset table. Presets will be in-code catalogues. Apply will return recommendations only (no writes). |

---

## Phase 13 Implementation Plan

### What Phase 13 Will Do

1. **CoA Templates**
   - In-code catalogue of templates (UK_SMALL_SERVICE, MANUFACTURING_BASE, RETAIL_BASE, GP_PRACTICE)
   - `listCoaTemplates`, `getCoaTemplateDetail`, `previewCoaApplication` — all read-only
   - `applyCoaTemplate` — will attempt safe Account inserts if tenantId + code unique constraint allows; otherwise returns 501

2. **Localisation**
   - `getTenantLocalisation` — reads Entity.currencyCode, returns defaults for locale/timezone with `supported:false`
   - `updateTenantLocalisation` — returns 501 (no TenantConfig table)

3. **Partner Portal**
   - `listPartnersForSuperAdmin` — returns empty list + schema-gap message
   - `listTenantsForPartner` — returns empty list + schema-gap message
   - Revenue-share calculation engine (pure function, no writes)

4. **Industry Presets**
   - In-code catalogue (MANUFACTURING, RETAIL, GP_HEALTHCARE, ACCOUNTING_PROFESSIONAL_SERVICES)
   - `listIndustryPresets`, `getIndustryPresetDetail` — read-only
   - `applyIndustryPreset` — returns recommendations only (no writes)

### What Remains Blocked for Future Schema Migration

- TenantConfig table for locale/timezone persistence
- Partner + PartnerTenant tables for partner management
- CoATemplate table for template persistence (optional)
- IndustryPreset table for preset persistence (optional)
- RevenueShare table for revenue share history (optional)
- Module enablement flags on Tenant or TenantConfig

---

## Phase 13 Constraints

- **Read-only**: All AI/analytics features remain read-only (no writes to business entities)
- **Tenant-scoped**: All operations respect tenant boundaries
- **RBAC-guarded**: Super-admin only for partner-wide views; tenant admin for tenant config
- **Schema-safe**: No schema modifications; all gaps return 501 with clear messages
- **No JSON/file stores**: All templates/presets are in-code TypeScript constants

