/**
 * Phase 8 — CRM Activities
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface CrmActivityInput {
  contactId?: string;
  accountId?: string;
  type: string; // call, email, meeting, note
  subject: string;
  description?: string;
  dueDate?: Date;
}

export async function listActivities(
  scope: { tenantId: string; entityId?: string | null },
  contactId?: string,
  accountId?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const where: any = { tenantId: scope.tenantId };
  if (contactId) {
    where.contactId = contactId;
  }
  if (accountId) {
    where.accountId = accountId;
  }

  const activities = await prisma.crmActivity.findMany({
    where,
    include: {
      contact: {
        select: { id: true, firstName: true, lastName: true },
      },
      account: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return activities;
}

export async function createActivity(
  scope: { tenantId: string; entityId?: string | null },
  input: CrmActivityInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify contact exists if provided
  if (input.contactId) {
    const contact = await prisma.crmContact.findFirst({
      where: { id: input.contactId, tenantId: scope.tenantId },
    });
    if (!contact) {
      throw Object.assign(new Error("Contact not found"), { code: 404 });
    }
  }

  // Verify account exists if provided
  if (input.accountId) {
    const account = await prisma.crmAccount.findFirst({
      where: { id: input.accountId, tenantId: scope.tenantId },
    });
    if (!account) {
      throw Object.assign(new Error("Account not found"), { code: 404 });
    }
  }

  const activity = await prisma.crmActivity.create({
    data: {
      tenantId: scope.tenantId,
      contactId: input.contactId || null,
      accountId: input.accountId || null,
      type: input.type,
      subject: input.subject,
      description: input.description || null,
      dueDate: input.dueDate || null,
    },
    include: {
      contact: {
        select: { id: true, firstName: true, lastName: true },
      },
      account: {
        select: { id: true, name: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("crm.activity.created", {
      tenantId: scope.tenantId,
      activityId: activity.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return activity;
}

export async function completeActivity(
  scope: { tenantId: string; entityId?: string | null },
  activityId: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const activity = await prisma.crmActivity.findFirst({
    where: { id: activityId, tenantId: scope.tenantId },
  });

  if (!activity) {
    throw Object.assign(new Error("Activity not found"), { code: 404 });
  }

  const updated = await prisma.crmActivity.update({
    where: { id: activityId },
    data: {
      completedAt: new Date(),
    },
  });

  // Audit log
  try {
    await auditEvent("crm.activity.completed", {
      tenantId: scope.tenantId,
      activityId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}
