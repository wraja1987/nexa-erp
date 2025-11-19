/**
 * Phase 27 — Support Impersonation (Read-Only)
 *
 * Read-only impersonation mode for super-admin support without altering sessions.
 */

import type { NextRequest } from "next/server";
import { normalizeRole, type AppRole } from "@/lib/rbac/matrix";

export interface SupportContext {
  superAdminUserId: string;
  targetTenantId: string;
  targetUserId: string;
  effectiveTenantId: string;
  effectiveRoles: AppRole[]; // Intersection of target user roles + read-only mask
  isReadOnly: true; // Always true for support mode
}

/**
 * Build support context for impersonation
 */
export function buildSupportContext(
  superAdminUserId: string,
  targetTenantId: string,
  targetUserId: string,
  targetUserRole: string | null
): SupportContext {
  // Normalize target user role
  const targetRole = normalizeRole(targetUserRole);

  // In support mode, we constrain permissions (read-only mask)
  // Only allow read permissions, never write permissions
  const effectiveRoles: AppRole[] = [];

  // Map target role to read-only equivalent
  // For support mode, we use VIEWER role (most restrictive) to ensure read-only
  // In a real system, we might have a "SUPPORT" role with specific read permissions
  effectiveRoles.push("VIEWER");

  return {
    superAdminUserId,
    targetTenantId,
    targetUserId,
    effectiveTenantId: targetTenantId,
    effectiveRoles,
    isReadOnly: true,
  };
}

/**
 * Check if request is in support mode
 */
export function isSupportMode(req: NextRequest): boolean {
  const supportTenantId = req.headers.get("x-support-tenant-id");
  const supportUserId = req.headers.get("x-support-user-id");
  return !!(supportTenantId && supportUserId);
}

/**
 * Get support context from request headers
 */
export async function getSupportContextFromRequest(
  req: NextRequest,
  superAdminUserId: string
): Promise<SupportContext | null> {
  const targetTenantId = req.headers.get("x-support-tenant-id");
  const targetUserId = req.headers.get("x-support-user-id");

  if (!targetTenantId || !targetUserId) {
    return null;
  }

  // Fetch target user to get their role
  // In a real implementation, we'd fetch from DB
  // For now, return null if we can't determine (caller should handle)
  // This is a placeholder - actual implementation would fetch user from DB
  return null; // Caller should fetch user and call buildSupportContext
}

/**
 * Check if operation is allowed in support mode
 */
export function isWriteOperation(method: string, pathname: string): boolean {
  // POST, PUT, PATCH, DELETE are write operations
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return true;
  }

  // Some GET endpoints might be write operations (e.g., /api/action/trigger)
  // Check pathname for known write patterns
  const writePatterns = [
    "/api/",
    "/create",
    "/update",
    "/delete",
    "/trigger",
    "/approve",
    "/reject",
  ];

  return writePatterns.some((pattern) => pathname.includes(pattern));
}

/**
 * Validate support mode request
 */
export function validateSupportModeRequest(
  req: NextRequest,
  superAdminUserId: string
): { allowed: boolean; reason?: string; context?: SupportContext } {
  if (!isSupportMode(req)) {
    return { allowed: false, reason: "Not in support mode" };
  }

  // Check if operation is a write operation
  if (isWriteOperation(req.method, req.nextUrl.pathname)) {
    return {
      allowed: false,
      reason: "Write operations are not allowed in support mode (read-only)",
    };
  }

  // Context building would happen here after fetching user
  // For now, return allowed but context must be built by caller
  return {
    allowed: true,
    reason: "Support mode validation passed (context must be built separately)",
  };
}

