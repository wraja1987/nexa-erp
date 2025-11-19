import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function listUnreconciledBankTransactions(
  scope: { tenantId: string; entityId?: string | null },
  accountCode?: string,
  opts?: { limit?: number; offset?: number }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Performance: Pagination defaults (limit 100, max 1000)
  const limit = Math.min(opts?.limit || 100, 1000);
  const offset = opts?.offset || 0;

  const acct = accountCode
    ? await prisma.bankAccount.findFirst({ where: { tenantId: scope.tenantId, code: accountCode } })
    : null;
  return prisma.bankStatementLine.findMany({
    where: {
      tenantId: scope.tenantId,
      reconciled: false,
      ...(acct ? { bankAccountId: acct.id } : {}),
    },
    orderBy: { date: "asc" },
    take: limit,
    skip: offset,
    // Performance: Explicit select
    select: {
      id: true,
      date: true,
      description: true,
      amount: true,
      reference: true,
      reconciled: true,
      bankAccountId: true,
    },
  });
}

export async function listUnreconciledLedgerItems(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Minimal candidate set: CustomerPayment + SupplierPayment
  const [ar, ap] = await Promise.all([
    prisma.customerPayment.findMany({ where: { tenantId: scope.tenantId } }),
    prisma.supplierPayment.findMany({ where: { tenantId: scope.tenantId } }),
  ]);
  return { ar, ap };
}

export async function suggestMatches(scope: { tenantId: string; entityId?: string | null }, accountCode?: string) {
  const lines = await listUnreconciledBankTransactions(scope, accountCode);
  const { ar, ap } = await listUnreconciledLedgerItems(scope);
  const suggestions: Array<{
    bankLineId: string;
    date: string;
    amount: number;
    candidates: Array<{ type: "AR" | "AP"; id: string; amount: number; paidAt: string; method: string; reference?: string }>;
  }> = [];
  const withinDays = (d1: Date, d2: Date, days: number) => Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)) <= days;
  for (const line of lines) {
    const amount = Number(line.amount || 0);
    const candidates: Array<{ type: "AR" | "AP"; id: string; amount: number; paidAt: string; method: string; reference?: string }> = [];
    for (const p of ar) {
      if (Math.abs(Number(p.amount || 0) - amount) < 0.01 && withinDays(new Date(p.paidAt as any), new Date(line.date), 5)) {
        candidates.push({ type: "AR", id: p.id, amount: Number(p.amount || 0), paidAt: (p.paidAt as any as Date).toISOString(), method: p.method, reference: p.reference || undefined });
      }
    }
    for (const p of ap) {
      if (Math.abs(Number(p.amount || 0) + amount) < 0.01 && withinDays(new Date(p.paidAt as any), new Date(line.date), 5)) {
        candidates.push({ type: "AP", id: p.id, amount: Number(p.amount || 0), paidAt: (p.paidAt as any as Date).toISOString(), method: p.method, reference: p.reference || undefined });
      }
    }
    suggestions.push({ bankLineId: line.id, date: (line.date as any as Date).toISOString(), amount, candidates });
  }
  return suggestions;
}

export async function reconcileMatch(scope: { tenantId: string; entityId?: string | null }, bankLineId: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Minimal persistence: flag bank line as reconciled
  const line = await prisma.bankStatementLine.findFirst({ where: { id: bankLineId, tenantId: scope.tenantId } });
  if (!line) throw Object.assign(new Error("not_found"), { code: 404 });
  await prisma.bankStatementLine.update({ where: { id: line.id }, data: { reconciled: true } });
  return { ok: true };
}


