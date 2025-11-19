import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function getCashPosition(scope: { tenantId: string; entityId?: string | null }, asOf: Date) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const accounts = await prisma.bankAccount.findMany({ where: { tenantId: scope.tenantId } });
  const rows: Array<{ accountId: string; code: string; name: string; currency: string; balanceMinor: number }> = [];
  for (const acct of accounts) {
    const sum = await prisma.bankStatementLine.aggregate({
      where: { tenantId: scope.tenantId, bankAccountId: acct.id, date: { lte: asOf } },
      _sum: { amount: true },
    });
    rows.push({
      accountId: acct.id,
      code: acct.code,
      name: acct.name,
      currency: acct.currency,
      balanceMinor: Number(sum._sum.amount || 0),
    });
  }
  return { asOf: asOf.toISOString(), rows };
}

export async function getShortTermCashflow(scope: { tenantId: string; entityId?: string | null }, from: Date, to: Date) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const invs = await prisma.customerInvoice.findMany({
    where: { tenantId: scope.tenantId, status: { notIn: ["paid", "void"] as any }, dueAt: { gte: from, lte: to } },
    select: { number: true, total: true, currency: true, dueAt: true },
  });
  const bills = await prisma.supplierBill.findMany({
    where: { tenantId: scope.tenantId, status: { notIn: ["paid", "void"] as any }, dueAt: { gte: from, lte: to } },
    select: { number: true, total: true, currency: true, dueAt: true },
  });
  const inflows = invs.map((i) => ({ type: "AR", number: i.number, amountMinor: Number(i.total || 0), currency: i.currency, dueAt: (i.dueAt as any as Date)?.toISOString() }));
  const outflows = bills.map((b) => ({ type: "AP", number: b.number, amountMinor: Number(b.total || 0), currency: b.currency, dueAt: (b.dueAt as any as Date)?.toISOString() }));
  return { from: from.toISOString(), to: to.toISOString(), inflows, outflows };
}


