/**
 * Enhanced Payroll Journal Posting
 * 
 * Posts detailed payroll journals to Finance GL with proper account breakdown:
 * - Payroll Expense (Gross Pay + NI Employer + Pension Employer)
 * - PAYE Liability
 * - NI Employee Liability
 * - NI Employer Liability
 * - Pension Employee Liability
 * - Pension Employer Expense
 * - Student Loan Liability
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEventInTx } from "@/lib/observability/audit";
import type { PayrollCalculationResult } from "./engine";

export interface PayrollJournalAccounts {
  payrollExpense: string; // Code for gross pay expense
  payeLiability: string; // Code for PAYE tax liability
  niEmployeeLiability: string; // Code for NI employee liability
  niEmployerLiability: string; // Code for NI employer liability
  pensionEmployeeLiability: string; // Code for pension employee liability
  pensionEmployerExpense: string; // Code for pension employer expense
  studentLoanLiability: string; // Code for student loan liability
}

const DEFAULT_ACCOUNTS: PayrollJournalAccounts = {
  payrollExpense: "PAYEXP",
  payeLiability: "PAYELIAB",
  niEmployeeLiability: "NIEMPLIAB",
  niEmployerLiability: "NIERLIAB",
  pensionEmployeeLiability: "PENEMPLIAB",
  pensionEmployerExpense: "PENEREXP",
  studentLoanLiability: "STULOANLIAB",
};

/**
 * Post payroll journal entry with detailed breakdown
 */
export async function postPayrollJournal(
  scope: { tenantId: string; entityId?: string | null },
  runId: string,
  calculations: PayrollCalculationResult[],
  accounts?: Partial<PayrollJournalAccounts>
): Promise<{ ok: boolean; entryId: string | null; error?: string }> {
  await assertLegalEntityAccess({
    tenantId: scope.tenantId,
    entityId: scope.entityId || undefined,
  });

  if (calculations.length === 0) {
    return { ok: true, entryId: null };
  }

  const accountCodes = { ...DEFAULT_ACCOUNTS, ...accounts };

  // Aggregate totals
  const totals = calculations.reduce(
    (acc, calc) => ({
      gross: acc.gross + calc.periodGross,
      payeTax: acc.payeTax + calc.payeTax,
      niEmployee: acc.niEmployee + calc.niEmployee,
      niEmployer: acc.niEmployer + calc.niEmployer,
      pensionEmployee: acc.pensionEmployee + calc.pensionEmployee,
      pensionEmployer: acc.pensionEmployer + calc.pensionEmployer,
      studentLoan: acc.studentLoan + calc.studentLoan,
    }),
    {
      gross: 0,
      payeTax: 0,
      niEmployee: 0,
      niEmployer: 0,
      pensionEmployee: 0,
      pensionEmployer: 0,
      studentLoan: 0,
    }
  );

  const totalExpense = totals.gross + totals.niEmployer + totals.pensionEmployer;
  const totalLiability = totals.payeTax + totals.niEmployee + totals.niEmployer + totals.pensionEmployee + totals.studentLoan;

  return await prisma.$transaction(async (tx) => {
    // Ensure all accounts exist
    const accountMap = new Map<string, string>();
    const accountEntries = Object.entries(accountCodes);

    for (const [key, code] of accountEntries) {
      const account = await tx.account.upsert({
        where: { tenantId_code: { tenantId: scope.tenantId, code } as any },
        update: {},
        create: {
          tenantId: scope.tenantId,
          code,
          type: getAccountType(key),
          name: getAccountName(key),
        },
      });
      accountMap.set(code, account.id);
    }

    // Create journal entry with lines
    const lines = [
      // Debit: Payroll Expense (Gross + NI Employer + Pension Employer)
      {
        tenantId: scope.tenantId,
        accountId: accountMap.get(accountCodes.payrollExpense)!,
        debit: totalExpense as any,
        credit: 0 as any,
      },
      // Credit: PAYE Liability
      {
        tenantId: scope.tenantId,
        accountId: accountMap.get(accountCodes.payeLiability)!,
        debit: 0 as any,
        credit: totals.payeTax as any,
      },
      // Credit: NI Employee Liability
      {
        tenantId: scope.tenantId,
        accountId: accountMap.get(accountCodes.niEmployeeLiability)!,
        debit: 0 as any,
        credit: totals.niEmployee as any,
      },
      // Credit: NI Employer Liability
      {
        tenantId: scope.tenantId,
        accountId: accountMap.get(accountCodes.niEmployerLiability)!,
        debit: 0 as any,
        credit: totals.niEmployer as any,
      },
      // Credit: Pension Employee Liability
      {
        tenantId: scope.tenantId,
        accountId: accountMap.get(accountCodes.pensionEmployeeLiability)!,
        debit: 0 as any,
        credit: totals.pensionEmployee as any,
      },
      // Debit: Pension Employer Expense (already included in payroll expense, but separate line for clarity)
      {
        tenantId: scope.tenantId,
        accountId: accountMap.get(accountCodes.pensionEmployerExpense)!,
        debit: totals.pensionEmployer as any,
        credit: 0 as any,
      },
      // Credit: Student Loan Liability
      {
        tenantId: scope.tenantId,
        accountId: accountMap.get(accountCodes.studentLoanLiability)!,
        debit: 0 as any,
        credit: totals.studentLoan as any,
      },
    ];

    const entry = await tx.journalEntry.create({
      data: {
        tenantId: scope.tenantId,
        docRef: `PAY:${runId}`,
        memo: `Payroll posting for run ${runId}`,
        lines: { create: lines },
      },
      include: { lines: true },
    });

    await auditEventInTx(tx, "hr.payroll.journal.posted", {
      tenantId: scope.tenantId,
      actorId: "system",
      entryId: entry.id,
      runId,
      totalGross: totals.gross,
      totalExpense,
      totalLiability,
    });

    return { ok: true, entryId: entry.id };
  });
}

function getAccountType(key: string): string {
  if (key.includes("Expense")) return "expense";
  if (key.includes("Liability")) return "liability";
  return "expense";
}

function getAccountName(key: string): string {
  const names: Record<string, string> = {
    payrollExpense: "Payroll Expense",
    payeLiability: "PAYE Tax Liability",
    niEmployeeLiability: "NI Employee Liability",
    niEmployerLiability: "NI Employer Liability",
    pensionEmployeeLiability: "Pension Employee Liability",
    pensionEmployerExpense: "Pension Employer Expense",
    studentLoanLiability: "Student Loan Liability",
  };
  return names[key] || key;
}

