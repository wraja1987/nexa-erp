import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export type ParsedStatementLine = { date: string; description: string; amount: number; reference?: string };

export function parseBankStatementFile(csv: string): ParsedStatementLine[] {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: ParsedStatementLine[] = [];
  for (const line of lines) {
    const [date, description, amountStr, reference] = line.split(",").map((s) => (s || "").trim());
    if (!date || !description || !amountStr) continue;
    const amount = Number(amountStr);
    if (Number.isFinite(amount)) out.push({ date, description, amount, reference });
  }
  return out;
}

export async function previewBankStatement(_scope: { tenantId: string; entityId?: string | null }, file: string) {
  const rows = parseBankStatementFile(file);
  return { rows, count: rows.length };
}

export async function importBankStatement(scope: { tenantId: string; entityId?: string | null }, file: string, accountCode: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const acct = await prisma.bankAccount.upsert({
    where: { tenantId_code: { tenantId: scope.tenantId, code: accountCode } as any },
    update: {},
    create: { tenantId: scope.tenantId, code: accountCode, name: accountCode, currency: "GBP" },
  });
  const rows = parseBankStatementFile(file);
  let created = 0;
  for (const r of rows) {
    await prisma.bankStatementLine.create({
      data: {
        tenantId: scope.tenantId,
        bankAccountId: acct.id,
        date: new Date(r.date),
        description: r.description,
        amount: r.amount as any,
        reference: r.reference || null,
      },
    });
    created++;
  }
  return { created, accountId: acct.id };
}


