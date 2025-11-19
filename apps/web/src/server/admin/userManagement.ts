/**
 * Phase 27 — Tenant Admin User Management
 *
 * Backend services for per-tenant user management (CRUD, roles, deactivation).
 */

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { addMinutes } from "date-fns";
import bcrypt from "bcryptjs";
import { normalizeRole, type AppRole } from "@/lib/rbac/matrix";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { UserCreated, UserRolesChanged, UserDeactivated, UserReactivated, UserPasswordResetTriggered } from "@/server/events/types";
import { incrementCounter } from "@/server/observability/metrics";
import { auditEvent } from "@/lib/observability/audit";

export interface TenantUser {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  role?: string;
  sendInvite?: boolean; // If true, trigger password reset flow
}

/**
 * List users for a tenant
 */
export async function listUsersForTenant(tenantId: string): Promise<TenantUser[]> {
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { created_at: "desc" },
  });

  // Get last login for each user (best-effort from sessions)
  const usersWithLogin: TenantUser[] = [];

  for (const user of users) {
    let lastLoginAt: Date | null = null;
    try {
      const latestSession = await prisma.session.findFirst({
        where: { userId: user.id },
        orderBy: { expires: "desc" },
        select: { expires: true },
      });
      if (latestSession) {
        lastLoginAt = latestSession.expires;
      }
    } catch {
      // Ignore errors
    }

    usersWithLogin.push({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active ?? true,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt,
    });
  }

  return usersWithLogin;
}

/**
 * Create a user for a tenant
 */
export async function createTenantUser(
  tenantId: string,
  input: CreateUserInput,
  actorId: string
): Promise<{ supported: boolean; user?: TenantUser; reason?: string }> {
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      return {
        supported: false,
        reason: `User with email ${input.email} already exists`,
      };
    }

    // Normalize role
    const role = input.role ? normalizeRole(input.role) : "VIEWER";

    // Create user (without password - will be set via invite/reset flow)
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        name: input.name || null,
        role,
        tenantId,
        active: true,
        password_hash: null, // No password - user must set via invite/reset (field name may vary)
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        created_at: true,
        updated_at: true,
      },
    });

    // If sendInvite is true, trigger password reset flow
    if (input.sendInvite) {
      await triggerPasswordResetInternal(tenantId, user.id);
    }

    // Publish event
    try {
      const event: UserCreated = {
        id: newEventId(),
        tenantId,
        type: "user.created",
        occurredAt: nowIso(),
        source: "admin.userManagement",
        version: 1,
        payload: {
          userId: user.id,
          email: user.email,
          role: user.role,
          actorId,
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[UserManagement] Failed to publish user.created event:`, error);
    }

    // Record metrics
    incrementCounter("admin_users_created_total", {
      tenantId,
      result: "success",
    });

    // Audit log (best-effort)
    try {
      await auditEvent("user.created", {
        tenantId,
        userId: user.id,
        email: user.email,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active ?? true,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: null,
      },
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to create user: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Update user roles
 */
export async function updateTenantUserRoles(
  tenantId: string,
  userId: string,
  role: string,
  actorId: string
): Promise<{ supported: boolean; user?: TenantUser; reason?: string }> {
  try {
    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return {
        supported: false,
        reason: `User ${userId} not found or does not belong to tenant ${tenantId}`,
      };
    }

    // Normalize role
    const normalizedRole = normalizeRole(role);

    const oldRole = user.role;

    // Update role
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: normalizedRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Publish event
    try {
      const event: UserRolesChanged = {
        id: newEventId(),
        tenantId,
        type: "user.roles.changed",
        occurredAt: nowIso(),
        source: "admin.userManagement",
        version: 1,
        payload: {
          userId,
          oldRole,
          newRole: normalizedRole,
          actorId,
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[UserManagement] Failed to publish user.roles.changed event:`, error);
    }

    // Record metrics
    incrementCounter("admin_user_role_changes_total", {
      tenantId,
      result: "success",
    });

    // Audit log (best-effort)
    try {
      await auditEvent("user.roles.changed", {
        tenantId,
        userId,
        oldRole,
        newRole: normalizedRole,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        active: updated.active ?? true,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
        lastLoginAt: null, // Would need to fetch separately
      },
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to update user roles: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Deactivate a user
 */
export async function deactivateTenantUser(
  tenantId: string,
  userId: string,
  actorId: string
): Promise<{ supported: boolean; reason?: string }> {
  try {
    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return {
        supported: false,
        reason: `User ${userId} not found or does not belong to tenant ${tenantId}`,
      };
    }

    // Update active status
    await prisma.user.update({
      where: { id: userId },
      data: { active: false },
    });

    // Publish event
    try {
      const event: UserDeactivated = {
        id: newEventId(),
        tenantId,
        type: "user.deactivated",
        occurredAt: nowIso(),
        source: "admin.userManagement",
        version: 1,
        payload: {
          userId,
          actorId,
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[UserManagement] Failed to publish user.deactivated event:`, error);
    }

    // Record metrics
    incrementCounter("admin_users_deactivated_total", {
      tenantId,
      result: "success",
    });

    // Audit log (best-effort)
    try {
      await auditEvent("user.deactivated", {
        tenantId,
        userId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to deactivate user: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Reactivate a user
 */
export async function reactivateTenantUser(
  tenantId: string,
  userId: string,
  actorId: string
): Promise<{ supported: boolean; reason?: string }> {
  try {
    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return {
        supported: false,
        reason: `User ${userId} not found or does not belong to tenant ${tenantId}`,
      };
    }

    // Update active status
    await prisma.user.update({
      where: { id: userId },
      data: { active: true },
    });

    // Publish event
    try {
      const event: UserReactivated = {
        id: newEventId(),
        tenantId,
        type: "user.reactivated",
        occurredAt: nowIso(),
        source: "admin.userManagement",
        version: 1,
        payload: {
          userId,
          actorId,
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[UserManagement] Failed to publish user.reactivated event:`, error);
    }

    // Audit log (best-effort)
    try {
      await auditEvent("user.reactivated", {
        tenantId,
        userId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to reactivate user: ${error?.message || "Unknown error"}`,
    };
  }
}

/**
 * Trigger password reset for a user (internal helper)
 */
async function triggerPasswordResetInternal(tenantId: string, userId: string): Promise<void> {
  try {
    const RESET_EXPIRY_MINUTES = 60; // 1 hour

    // Generate token
    const token = randomBytes(32).toString("hex");
    const expiresAt = addMinutes(new Date(), RESET_EXPIRY_MINUTES);

    // Invalidate existing tokens
    await (prisma as any).passwordResetToken.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    // Create new token
    await (prisma as any).passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
        used: false,
      },
    });

    // TODO: Send email (would need SMTP integration)
    // For now, token is created but email is not sent
  } catch (error) {
    // Best-effort: log but don't fail
    console.warn(`[UserManagement] Failed to trigger password reset for user ${userId}:`, error);
  }
}

/**
 * Trigger password reset for a user
 */
export async function triggerPasswordReset(
  tenantId: string,
  userId: string,
  actorId: string
): Promise<{ supported: boolean; reason?: string }> {
  try {
    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return {
        supported: false,
        reason: `User ${userId} not found or does not belong to tenant ${tenantId}`,
      };
    }

    await triggerPasswordResetInternal(tenantId, userId);

    // Publish event
    try {
      const event: UserPasswordResetTriggered = {
        id: newEventId(),
        tenantId,
        type: "user.passwordreset.triggered",
        occurredAt: nowIso(),
        source: "admin.userManagement",
        version: 1,
        payload: {
          userId,
          actorId,
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[UserManagement] Failed to publish user.passwordreset.triggered event:`, error);
    }

    // Audit log (best-effort)
    try {
      await auditEvent("user.passwordreset.triggered", {
        tenantId,
        userId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to trigger password reset: ${error?.message || "Unknown error"}`,
    };
  }
}

