import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export type BankAccountInput = {
  code: string;
  name: string;
  currency?: string;
};

export async function listBankAccounts(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.bankAccount.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { code: "asc" },
  });
}

export async function getBankAccount(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const acct = await prisma.bankAccount.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!acct) throw Object.assign(new Error("not_found"), { code: 404 });
  return acct;
}

export async function createBankAccount(scope: { tenantId: string; entityId?: string | null }, data: BankAccountInput) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.bankAccount.create({
    data: {
      tenantId: scope.tenantId,
      code: data.code,
      name: data.name,
      currency: data.currency || "GBP",
    },
  });
}

export async function updateBankAccount(scope: { tenantId: string; entityId?: string | null }, id: string, data: Partial<BankAccountInput>) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const acct = await getBankAccount(scope, id);
  return prisma.bankAccount.update({
    where: { id: acct.id },
    data: {
      name: data.name ?? acct.name,
      currency: data.currency ?? acct.currency,
    },
  });
}

export async function archiveBankAccount(_scope: { tenantId: string; entityId?: string | null }, _id: string) {
  // Schema gap: no status/archived column on BankAccount
  throw Object.assign(new Error("not_supported"), { code: 501 });
}


