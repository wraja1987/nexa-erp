# RBAC Matrix (Task 5)

Permissions and SoD rules enforced in application code. See `apps/web/src/lib/rbac/matrix.ts` and `apps/web/app/api/**` routes.

## Permissions

- ui:finance_reports:view → ADMIN, SUPER_ADMIN
- finance:approve_invoice → ADMIN, MANAGER, SUPER_ADMIN
- finance:record_payment → ADMIN, MANAGER, SUPER_ADMIN
- inventory:receive_grn → ADMIN, MANAGER, STAFF, SUPER_ADMIN
- mfg:consume_bom → ADMIN, MANAGER, SUPER_ADMIN
- pos:finalise_sale → ADMIN, MANAGER, STAFF, SUPER_ADMIN
- projects:timesheet_rollup → ADMIN, MANAGER, SUPER_ADMIN

## Separation of Duties (SoD)

- Only SUPER_ADMIN can grant/revoke SUPER_ADMIN.
- ADMIN cannot change their own role.
- Cross-tenant role updates are rejected.

Enforced in: `apps/web/app/api/admin/users/role/route.ts`.

## Production overrides

- x-role header override is ignored in production; non-production only for tests/e2e.


