/**
 * Phase 27 — RBAC Visibility and Mapping
 *
 * Read-only view of RBAC matrix and per-tenant user roles.
 */

import { matrix, type AppRole, ALL_ROLES } from "@/lib/rbac/matrix";
import { listUsersForTenant } from "./userManagement";

export interface RolePermissionMapping {
  role: AppRole;
  permissions: string[];
}

export interface UserRoleView {
  userId: string;
  email: string;
  name: string | null;
  role: AppRole | null;
  permissions: string[];
}

/**
 * Get role → permission matrix
 */
export function getRolePermissionMatrix(): RolePermissionMapping[] {
  const mappings: RolePermissionMapping[] = [];

  // Build reverse mapping: role → permissions
  const rolePermissions = new Map<AppRole, Set<string>>();

  // Initialize all roles
  for (const role of ALL_ROLES) {
    rolePermissions.set(role, new Set<string>());
  }

  // Build permission → roles mapping
  for (const [permission, allowedRoles] of Object.entries(matrix)) {
    for (const role of allowedRoles) {
      rolePermissions.get(role)?.add(permission);
    }
  }

  // Convert to array
  for (const role of ALL_ROLES) {
    const permissions = Array.from(rolePermissions.get(role) || []);
    mappings.push({
      role,
      permissions: permissions.sort(),
    });
  }

  return mappings;
}

/**
 * Get tenant user role view
 */
export async function getTenantUserRoleView(tenantId: string): Promise<UserRoleView[]> {
  const users = await listUsersForTenant(tenantId);

  const views: UserRoleView[] = [];

  for (const user of users) {
    const role = user.role ? (user.role as AppRole) : null;
    const permissions: string[] = [];

    if (role) {
      // Get permissions for this role
      for (const [permission, allowedRoles] of Object.entries(matrix)) {
        if (allowedRoles.includes(role)) {
          permissions.push(permission);
        }
      }
    }

    views.push({
      userId: user.id,
      email: user.email,
      name: user.name,
      role,
      permissions: permissions.sort(),
    });
  }

  return views;
}

