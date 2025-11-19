import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { postPayrollJournal as postPayrollJournalEnhanced } from "@/server/payroll/journals";
import { calculatePayrollRun } from "@/server/payroll/engine";

/**
 * Post payroll journal (enhanced version with detailed breakdown)
 * Falls back to basic version if enhanced engine not available
 */
export async function postPayrollJournal(scope: { tenantId: string; entityId?: string | null }, runId: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  try {
    // Try enhanced journal posting with detailed breakdown
    const calculations = await calculatePayrollRun(scope.tenantId, runId);
    const result = await postPayrollJournalEnhanced(scope, runId, calculations);
    return result;
  } catch (error: any) {
    // Fallback to basic journal posting
    console.warn(`[Payroll] Enhanced journal posting failed, using basic mode:`, error);
    const slips = await prisma.payslip.findMany({ where: { tenantId: scope.tenantId, runId } });
    const totalGross = slips.reduce((s, p) => s + Number(p.grossPay || 0), 0);
    if (totalGross === 0) {
      return { ok: true, entryId: null };
    }
    const [exp, liab] = await Promise.all([
      prisma.account.upsert({ where: { tenantId_code: { tenantId: scope.tenantId, code: "PAYEXP" } as any }, update: {}, create: { tenantId: scope.tenantId, code: "PAYEXP", type: "expense", name: "Payroll Expense" } }),
      prisma.account.upsert({ where: { tenantId_code: { tenantId: scope.tenantId, code: "PAYLIAB" } as any }, update: {}, create: { tenantId: scope.tenantId, code: "PAYLIAB", type: "liability", name: "Payroll Liability" } }),
    ]);
    const entry = await prisma.journalEntry.create({
      data: {
        tenantId: scope.tenantId,
        docRef: `PAY:${runId}`,
        memo: "Payroll posting",
        lines: {
          create: [
            { tenantId: scope.tenantId, accountId: exp.id, debit: totalGross as any, credit: 0 as any },
            { tenantId: scope.tenantId, accountId: liab.id, debit: 0 as any, credit: totalGross as any },
          ],
        },
      },
      include: { lines: true },
    });
    return { ok: true, entryId: entry.id };
  }
}


