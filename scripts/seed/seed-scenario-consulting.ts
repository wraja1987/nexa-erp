#!/usr/bin/env tsx
/**
 * Consulting Scenario Seed Script
 *
 * Seeds:
 * - Finance (CoA, invoices with consulting fees, time/billing JournalEntries)
 * - Banking (accounts, statements)
 * - HR/Payroll (consultants, payroll runs)
 * - Analytics (KPI snapshots)
 */

/* eslint-disable no-console */
import { PrismaClient, Prisma } from "@prisma/client";
import { runScenarioSeed } from "./seed-scenario-base";
import {
  ensureScenarioTenant,
  ensureScenarioUser,
  seedAccountsIfEmpty,
  seedOpeningBalancesIfEmpty,
  seedEmployeesIfEmpty,
  seedBankAccountsIfEmpty,
  getScenarioConfig,
} from "@/server/seeding/seedHelpers";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { FinanceInvoiceCreated } from "@/server/events/types";

export async function seedConsultingScenario(prisma: PrismaClient) {
  const config = getScenarioConfig("consulting");
  console.log(`💼 Consulting Scenario: ${config.name}`);

  const { tenantId } = await ensureScenarioTenant(prisma, "consulting");
  await ensureScenarioUser(prisma, tenantId, config.defaultUserEmail, config.defaultUserRole, config.defaultUserPassword);

  await seedAccountsIfEmpty(prisma, tenantId, "consulting");
  await seedOpeningBalancesIfEmpty(prisma, tenantId, "consulting");

  // Seed employees (consultants)
  const { employeesCreated, employeeIds } = await seedEmployeesIfEmpty(prisma, tenantId, [
    { empNo: "EMP-CON-001", firstName: "Alice", lastName: "Johnson", email: "alice.johnson@consulting.nexa.demo" },
    { empNo: "EMP-CON-002", firstName: "Bob", lastName: "Williams", email: "bob.williams@consulting.nexa.demo" },
    { empNo: "EMP-CON-003", firstName: "Carol", lastName: "Brown", email: "carol.brown@consulting.nexa.demo" },
  ]);
  console.log(`✅ Employees: ${employeesCreated} created`);

  // Seed customer invoices (consulting fees)
  const invoiceCount = await prisma.customerInvoice.count({ where: { tenantId } });
  if (invoiceCount === 0) {
    const inv1 = await prisma.customerInvoice.create({
      data: {
        tenantId,
        number: "INV-CON-001",
        customerId: "CUST-CON-001",
        currency: "GBP",
        total: new Prisma.Decimal(5000),
        status: "approved",
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const inv2 = await prisma.customerInvoice.create({
      data: {
        tenantId,
        number: "INV-CON-002",
        customerId: "CUST-CON-002",
        currency: "GBP",
        total: new Prisma.Decimal(7500),
        status: "draft",
        issuedAt: new Date(),
      },
    });

    await prisma.customerPayment.create({
      data: {
        tenantId,
        invoiceId: inv1.id,
        amount: new Prisma.Decimal(5000),
        method: "bank_transfer",
        reference: "PAY-CON-001",
      },
    });

    try {
      const event: FinanceInvoiceCreated = {
        id: newEventId(),
        tenantId,
        type: "finance.invoice.created",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: inv1.id,
          number: inv1.number,
          totalMinor: Number(inv1.total) * 100,
          currencyCode: inv1.currency,
          issuedAt: inv1.issuedAt.toISOString(),
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[Seed] Failed to publish invoice event:`, error);
    }

    console.log(`✅ Customer invoices: 2 created, 1 payment`);
  }

  // Seed time/billing JournalEntries (consulting hours)
  const journalCount = await prisma.journalEntry.count({ where: { tenantId, memo: { contains: "Consulting" } } });
  if (journalCount === 0) {
    const revenueAccount = await prisma.account.findFirst({ where: { tenantId, code: "4000" } });
    const arAccount = await prisma.account.findFirst({ where: { tenantId, code: "1100" } });

    if (revenueAccount && arAccount) {
      await prisma.journalEntry.create({
        data: {
          tenantId,
          memo: "Consulting hours - Project Alpha",
          postedAt: new Date(),
          lines: {
            create: [
              {
                tenantId,
                accountId: arAccount.id,
                debit: new Prisma.Decimal(5000),
                credit: new Prisma.Decimal(0),
              },
              {
                tenantId,
                accountId: revenueAccount.id,
                debit: new Prisma.Decimal(0),
                credit: new Prisma.Decimal(5000),
              },
            ],
          },
        },
      });
      console.log(`✅ Journal entries: 1 created`);
    }
  }

  // Seed payroll
  if (Object.keys(employeeIds).length > 0) {
    const payrollCount = await prisma.payrollRun.count({ where: { tenantId } });
    if (payrollCount === 0) {
      const schedule = await prisma.paySchedule.create({
        data: {
          tenantId,
          name: "Monthly",
          frequency: "monthly",
        },
      });

      const run = await prisma.payrollRun.create({
        data: {
          tenantId,
          scheduleId: schedule.id,
          periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          status: "posted",
        },
      });

      await prisma.payslip.createMany({
        data: [
          {
            tenantId,
            runId: run.id,
            employeeId: employeeIds["EMP-CON-001"],
            grossPay: new Prisma.Decimal(5000),
            netPay: new Prisma.Decimal(4000),
          },
          {
            tenantId,
            runId: run.id,
            employeeId: employeeIds["EMP-CON-002"],
            grossPay: new Prisma.Decimal(5500),
            netPay: new Prisma.Decimal(4400),
          },
          {
            tenantId,
            runId: run.id,
            employeeId: employeeIds["EMP-CON-003"],
            grossPay: new Prisma.Decimal(4800),
            netPay: new Prisma.Decimal(3840),
          },
        ],
      });

      console.log(`✅ Payroll: 1 run, 3 payslips`);
    }
  }

  // Seed bank accounts
  await seedBankAccountsIfEmpty(prisma, tenantId, [
    { code: "BANK-CON-001", name: "Consulting Operating Account", currency: "GBP" },
  ]);

  // Seed KPI snapshots
  const kpiCount = await prisma.kpiSnapshot.count({ where: { tenantId } });
  if (kpiCount === 0) {
    await prisma.kpiSnapshot.createMany({
      data: [
        { tenantId, name: "revenue", value: new Prisma.Decimal(5000), asOf: new Date() },
        { tenantId, name: "employees", value: new Prisma.Decimal(3), asOf: new Date() },
        { tenantId, name: "projects_active", value: new Prisma.Decimal(2), asOf: new Date() },
      ],
    });
    console.log(`✅ KPI snapshots: 3 created`);
  }

  console.log(`✅ Consulting scenario seed complete!`);
}

if (require.main === module) {
  runScenarioSeed("consulting", seedConsultingScenario).catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

