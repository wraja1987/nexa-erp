/**
 * Phase 8 — CRM Contacts
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface CrmContactInput {
  accountId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
}

export async function listContacts(
  scope: { tenantId: string; entityId?: string | null },
  accountId?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const where: any = { tenantId: scope.tenantId };
  if (accountId) {
    where.accountId = accountId;
  }

  const contacts = await prisma.crmContact.findMany({
    where,
    include: {
      account: {
        select: { id: true, name: true },
      },
      activities: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return contacts;
}

export async function getContact(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const contact = await prisma.crmContact.findFirst({
    where: { id, tenantId: scope.tenantId },
    include: {
      account: true,
      activities: true,
    },
  });

  if (!contact) {
    throw Object.assign(new Error("Contact not found"), { code: 404 });
  }

  return contact;
}

export async function createContact(
  scope: { tenantId: string; entityId?: string | null },
  input: CrmContactInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify account exists if provided
  if (input.accountId) {
    const account = await prisma.crmAccount.findFirst({
      where: { id: input.accountId, tenantId: scope.tenantId },
    });
    if (!account) {
      throw Object.assign(new Error("Account not found"), { code: 404 });
    }
  }

  const contact = await prisma.crmContact.create({
    data: {
      tenantId: scope.tenantId,
      accountId: input.accountId || null,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || null,
      phone: input.phone || null,
      title: input.title || null,
    },
    include: {
      account: {
        select: { id: true, name: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("crm.contact.created", {
      tenantId: scope.tenantId,
      contactId: contact.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return contact;
}

export async function updateContact(
  scope: { tenantId: string; entityId?: string | null },
  contactId: string,
  input: Partial<CrmContactInput>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const contact = await prisma.crmContact.findFirst({
    where: { id: contactId, tenantId: scope.tenantId },
  });

  if (!contact) {
    throw Object.assign(new Error("Contact not found"), { code: 404 });
  }

  const updated = await prisma.crmContact.update({
    where: { id: contactId },
    data: {
      ...(input.accountId !== undefined && { accountId: input.accountId || null }),
      ...(input.firstName && { firstName: input.firstName }),
      ...(input.lastName && { lastName: input.lastName }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
      ...(input.title !== undefined && { title: input.title || null }),
    },
  });

  // Audit log
  try {
    await auditEvent("crm.contact.updated", {
      tenantId: scope.tenantId,
      contactId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}
