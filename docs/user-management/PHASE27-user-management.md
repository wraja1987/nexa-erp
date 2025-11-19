# Phase 27 — User Management (Admin + Super-Admin)

**Last updated**: 2025-01-18  
**Status**: ✅ Complete

---

## Purpose

Implement Admin + Super-Admin User Management capabilities for Nexa ERP, including:
- Super-admin portal for tenant management and support
- Tenant admin user management (CRUD, roles, deactivation)
- RBAC visibility and mapping
- Read-only support impersonation mode
- Full audit trail and observability

All features are schema-safe, additive, and respect existing auth/RBAC constraints.

---

## Schema Inventory

### Tenant Model
- `id`: String (cuid)
- `name`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Gap**: No `status` field (active/suspended)
- **Gap**: No explicit subscription linkage (Subscription model exists but may not be linked)

### User Model
- `id`: String (cuid)
- `email`: String (unique)
- `role`: String? (default: "USER")
- `active`: Boolean? (default: true)
- `tenantId`: String (required, mapped as tenant_id)
- `password_hash`: String?
- `name`: String?
- `created_at`: DateTime
- `updated_at`: DateTime?
- `mfa_enabled`: Boolean (default: false)
- `mfa_secret`: String?
- `emailVerified`: DateTime?
- `image`: String?
- Relations: `accounts[]`, `sessions[]`, `password_reset_tokens[]`

### Account Model (NextAuth)
- `id`: String
- `userId`: String
- `provider`: String
- `providerAccountId`: String
- OAuth tokens and metadata

### Session Model (NextAuth)
- `id`: String
- `sessionToken`: String (unique)
- `userId`: String
- `expires`: DateTime

### Subscription Model
- `id`: String
- `tenantId`: String
- `planId`: String
- `status`: String
- `currentPeriodStart`: DateTime
- `currentPeriodEnd`: DateTime
- `customerId`: String?
- `trialEnd`: DateTime?
- `cancelAt`: DateTime?

### PasswordResetToken Model (if exists)
- Schema gap: May exist but structure unknown
- Used for password reset workflows

### AuditLog Model
- Schema gap: May exist but structure unknown
- Used for audit trail

---

## Capability Matrix

### Super-Admin Capabilities

| Feature | Supported | Schema Gap | Notes |
|---------|-----------|------------|-------|
| **Tenant Management** | | | |
| List tenants with summary | ✅ Yes | — | Uses Tenant model + User counts |
| Tenant detail view | ✅ Yes | — | Includes usage metrics |
| Tenant activation/suspension | ❌ No | Missing Tenant.status field | Returns `supported:false` |
| Tenant usage metrics | ✅ Yes | — | Derived from existing models |
| BYOK status view | ✅ Yes | — | Read-only from Phase 19 |
| Data residency status | ✅ Yes | — | Read-only from Phase 19 |
| **Support/Impersonation** | | | |
| Read-only impersonation | ✅ Yes | — | In-memory context, no session changes |
| Support view pages | ✅ Yes | — | Read-only, RBAC-constrained |
| **Audit** | | | |
| Super-admin action audit | ⚠️ Partial | AuditLog structure unknown | Best-effort via events |

### Tenant Admin Capabilities

| Feature | Supported | Schema Gap | Notes |
|---------|-----------|------------|-------|
| **User Management** | | | |
| List users for tenant | ✅ Yes | — | Uses User.tenantId filter |
| Create user | ✅ Yes | — | Creates User + triggers invite flow |
| Update user roles | ✅ Yes | — | Updates User.role field |
| Deactivate user | ✅ Yes | — | Sets User.active = false |
| Reactivate user | ✅ Yes | — | Sets User.active = true |
| Trigger password reset | ⚠️ Partial | PasswordResetToken structure unknown | Best-effort via existing flows |
| Send invite | ⚠️ Partial | No explicit invite model | Uses password reset flow |
| **RBAC Visibility** | | | |
| Role → permission matrix | ✅ Yes | — | Reads from rbac/matrix.ts |
| Per-user role view | ✅ Yes | — | Derived from User.role |
| **Department/Team** | ❌ No | Missing department/team fields | Returns `supported:false` |
| **Audit** | | | |
| User change audit | ⚠️ Partial | AuditLog structure unknown | Best-effort via events |

---

## Schema Gaps Summary

1. **Tenant.status field missing**: Cannot suspend/activate tenants (returns `supported:false`)
2. **Department/Team fields missing**: No department/team association for users
3. **PasswordResetToken structure unknown**: Password reset may work but structure unclear
4. **AuditLog structure unknown**: Audit logging is best-effort via events
5. **No explicit invite model**: Invites use password reset flow
6. **No impersonation token model**: Impersonation is in-memory only (read-only)

---

## Security Model

### Super-Admin Access
- **Permission**: `ui:superadmin:portal`
- **Role**: `SUPER_ADMIN` only
- **Scope**: Can view all tenants, usage metrics, BYOK/residency status
- **Actions**: Read-only tenant management (suspension requires schema change)

### Support Impersonation
- **Mode**: Read-only, in-memory context
- **Scope**: Super-admin can view tenant data "as" a user
- **Constraints**:
  - Does not change actual session
  - Does not bypass RBAC (only constrains)
  - Blocks all write operations (403/501)
  - Never persists auth state

### Tenant Admin Access
- **Permissions**: `ui:admin:users`, `ui:admin:rbac`
- **Roles**: `ADMIN`, `SUPER_ADMIN`
- **Scope**: Tenant-scoped user management
- **Actions**: CRUD users, role changes, deactivation/reactivation

---

## RBAC Integration

- **RBAC Matrix**: Code-based in `apps/web/src/lib/rbac/matrix.ts`
- **Role Storage**: User.role field (string)
- **Permission Resolution**: `hasPermission(role, perm)` function
- **Visibility**: Read-only view of roles → permissions → actions

---

## Events

- `user.created`: Published when user is created
- `user.roles.changed`: Published when user roles are updated
- `user.deactivated`: Published when user is deactivated
- `user.reactivated`: Published when user is reactivated
- `user.passwordreset.triggered`: Published when password reset is triggered
- `superadmin.supportview.opened`: Published when support view is opened

---

## Metrics

- `admin_users_created_total` (labels: tenantId, result)
- `admin_users_deactivated_total` (labels: tenantId, result)
- `admin_user_role_changes_total` (labels: tenantId, result)
- `superadmin_support_sessions_total` (labels: tenantId, result)

---

## Implementation Notes

- All user management is tenant-scoped
- All operations are RBAC-guarded
- All changes are audited (best-effort via events)
- Impersonation is read-only and additive
- Schema gaps are explicitly documented and return `supported:false` with clear messages

