/**
 * Phase 8 — CRM Accounts
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface CrmAccountInput {
  name: string;
  type?: string;
  website?: string;
  industry?: string;
}

export async function listAccounts(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const accounts = await prisma.crmAccount.findMany({
    where: { tenantId: scope.tenantId },
    include: {
      contacts: true,
      opportunities: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return accounts;
}

export async function getAccount(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const account = await prisma.crmAccount.findFirst({
    where: { id, tenantId: scope.tenantId },
    include: {
      contacts: true,
      opportunities: true,
      CrmActivity: true,
    },
  });

  if (!account) {
    throw Object.assign(new Error("Account not found"), { code: 404 });
  }

  return account;
}

export async function createAccount(
  scope: { tenantId: string; entityId?: string | null },
  input: CrmAccountInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const account = await prisma.crmAccount.create({
    data: {
      tenantId: scope.tenantId,
      name: input.name,
      type: input.type || null,
      website: input.website || null,
      industry: input.industry || null,
    },
  });

  // Audit log
  try {
    await auditEvent("crm.account.created", {
      tenantId: scope.tenantId,
      accountId: account.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return account;
}

export async function updateAccount(
  scope: { tenantId: string; entityId?: string | null },
  accountId: string,
  input: Partial<CrmAccountInput>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const account = await prisma.crmAccount.findFirst({
    where: { id: accountId, tenantId: scope.tenantId },
  });

  if (!account) {
    throw Object.assign(new Error("Account not found"), { code: 404 });
  }

  const updated = await prisma.crmAccount.update({
    where: { id: accountId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.type !== undefined && { type: input.type || null }),
      ...(input.website !== undefined && { website: input.website || null }),
      ...(input.industry !== undefined && { industry: input.industry || null }),
    },
  });

  // Audit log
  try {
    await auditEvent("crm.account.updated", {
      tenantId: scope.tenantId,
      accountId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}
