# RBAC Matrix Snapshot

Timestamp: 2025-11-08T22:21:16Z

## Roles
- SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER

## Permissions
- finance:approve_invoice → ADMIN, MANAGER, SUPER_ADMIN
- finance:record_payment → ADMIN, MANAGER, SUPER_ADMIN
- inventory:receive_grn → ADMIN, MANAGER, STAFF, SUPER_ADMIN
- mfg:consume_bom → ADMIN, MANAGER, SUPER_ADMIN
- pos:finalise_sale → ADMIN, MANAGER, STAFF, SUPER_ADMIN
- projects:timesheet_rollup → ADMIN, MANAGER, SUPER_ADMIN
- admin:role_change → ADMIN, SUPER_ADMIN
- ui:finance_reports:view → ADMIN, SUPER_ADMIN

## Separation of Duties (SoD)
- Only SUPER_ADMIN can grant SUPER_ADMIN
- ADMIN cannot change their own role

Source: apps/web/src/lib/rbac/matrix.ts
