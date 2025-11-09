import { prisma } from "@/lib/prisma";
import { auditEventInTx } from "@/lib/observability/audit";

export type JournalLineInput = {
  accountCode: string;
  debitMinor?: number;
  creditMinor?: number;
};

export type PostJournalInput = {
  tenantId: string;
  actorId: string;
  docRef?: string;
  memo?: string;
  lines: JournalLineInput[];
};

function isBalanced(lines: JournalLineInput[]): boolean {
  const debit = lines.reduce((sum, l) => sum + Number(l.debitMinor || 0), 0);
  const credit = lines.reduce((sum, l) => sum + Number(l.creditMinor || 0), 0);
  return debit === credit;
}

export async function postJournalEntry(input: PostJournalInput) {
  const { tenantId, actorId, docRef, memo, lines } = input;
  if (!Array.isArray(lines) || lines.length < 2) {
    throw Object.assign(new Error("At least two lines required"), { code: 400 });
  }
  if (!isBalanced(lines)) {
    throw Object.assign(new Error("Unbalanced journal"), { code: 400 });
  }
  return await prisma.$transaction(async (tx) => {
    // Ensure accounts exist by code
    const codeSet = Array.from(new Set(lines.map((l) => l.accountCode)));
    const accounts = await Promise.all(
      codeSet.map((code) =>
        tx.account.upsert({
          where: { tenantId_code: { tenantId, code } as any },
          update: {},
          create: { tenantId, code, type: "asset", name: code },
        })
      )
    );
    const codeToId = new Map(accounts.map((a) => [a.code, a.id]));

    const entry = await tx.journalEntry.create({
      data: {
        tenantId,
        docRef,
        memo,
        lines: {
          create: lines.map((l) => ({
            tenantId,
            accountId: codeToId.get(l.accountCode)!,
            debit: Number(l.debitMinor || 0) as any,
            credit: Number(l.creditMinor || 0) as any,
          })),
        },
      },
      include: { lines: true },
    });

    await auditEventInTx(tx, "finance.gl.posted", {
      tenantId,
      actorId,
      entryId: entry.id,
      docRef,
      nLines: entry.lines.length,
    });
    return entry;
  });
}

export async function getTrialBalance(tenantId: string, asOf?: Date) {
  // Aggregate from journal lines joined to accounts
  const lines = await prisma.journalLine.findMany({
    where: { tenantId },
    include: { account: true },
  });
  const map = new Map<
    string,
    { code: string; name: string; type: string; debit: number; credit: number }
  >();
  for (const l of lines) {
    const code = (l as any).account?.code || (l as any).accountId;
    const name = (l as any).account?.name || code;
    const type = (l as any).account?.type || "asset";
    const key = String(code);
    const cur = map.get(key) || { code, name, type, debit: 0, credit: 0 };
    cur.debit += Number(l.debit || 0);
    cur.credit += Number(l.credit || 0);
    map.set(key, cur);
  }
  const rows = Array.from(map.values()).map((r) => ({
    ...r,
    balance: r.debit - r.credit,
  }));
  const totals = rows.reduce(
    (acc, r) => {
      acc.debit += r.debit;
      acc.credit += r.credit;
      return acc;
    },
    { debit: 0, credit: 0 }
  );
  return { asOf: (asOf || new Date()).toISOString(), rows, totals };
}

export async function getPnL(tenantId: string) {
  const tb = await getTrialBalance(tenantId);
  const income = tb.rows.filter((r) => r.type === "revenue" || r.type === "income");
  const expense = tb.rows.filter((r) => r.type === "expense");
  const totalIncome = income.reduce((s, r) => s + (r.credit - r.debit), 0);
  const totalExpense = expense.reduce((s, r) => s + (r.debit - r.credit), 0);
  const net = totalIncome - totalExpense;
  return { asOf: tb.asOf, totalIncome, totalExpense, net, income, expense };
}

export async function getBalanceSheet(tenantId: string) {
  const tb = await getTrialBalance(tenantId);
  const assets = tb.rows.filter((r) => r.type === "asset");
  const liabilities = tb.rows.filter((r) => r.type === "liability");
  const equity = tb.rows.filter((r) => r.type === "equity");
  const totalAssets = assets.reduce((s, r) => s + r.balance, 0);
  const totalLiabilities = liabilities.reduce((s, r) => s + (r.credit - r.debit), 0);
  const totalEquity = equity.reduce((s, r) => s + (r.credit - r.debit), 0);
  return {
    asOf: tb.asOf,
    totals: { assets: totalAssets, liabilities: totalLiabilities, equity: totalEquity },
    assets,
    liabilities,
    equity,
  };
}


