#!/usr/bin/env tsx
/**
 * Healthcare Scenario Seed Script
 *
 * Seeds:
 * - Finance (CoA GP_PRACTICE template, practice billing invoices, NHS income)
 * - Banking (accounts, statements)
 * - HR/Payroll (GPs, nurses, admin staff, 1-2 months payroll runs)
 * - Healthcare (feeds getHealthcareOverview with employees/payroll data)
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

export async function seedHealthcareScenario(prisma: PrismaClient) {
  const config = getScenarioConfig("healthcare");
  console.log(`🏥 Healthcare Scenario: ${config.name}`);

  const { tenantId } = await ensureScenarioTenant(prisma, "healthcare");
  await ensureScenarioUser(prisma, tenantId, config.defaultUserEmail, config.defaultUserRole, config.defaultUserPassword);

  await seedAccountsIfEmpty(prisma, tenantId, "healthcare");
  await seedOpeningBalancesIfEmpty(prisma, tenantId, "healthcare");

  // Seed employees (GPs, nurses, admin)
  const { employeesCreated, employeeIds } = await seedEmployeesIfEmpty(prisma, tenantId, [
    { empNo: "EMP-HC-001", firstName: "Dr. Sarah", lastName: "Mitchell", email: "sarah.mitchell@healthcare.nexa.demo" },
    { empNo: "EMP-HC-002", firstName: "Dr. James", lastName: "Anderson", email: "james.anderson@healthcare.nexa.demo" },
    { empNo: "EMP-HC-003", firstName: "Nurse", lastName: "Patel", email: "nurse.patel@healthcare.nexa.demo" },
    { empNo: "EMP-HC-004", firstName: "Nurse", lastName: "Taylor", email: "nurse.taylor@healthcare.nexa.demo" },
    { empNo: "EMP-HC-005", firstName: "Admin", lastName: "Roberts", email: "admin.roberts@healthcare.nexa.demo" },
  ]);
  console.log(`✅ Employees: ${employeesCreated} created (2 GPs, 2 Nurses, 1 Admin)`);

  // Seed customer invoices (practice billing)
  const invoiceCount = await prisma.customerInvoice.count({ where: { tenantId } });
  if (invoiceCount === 0) {
    const inv1 = await prisma.customerInvoice.create({
      data: {
        tenantId,
        number: "INV-HC-001",
        customerId: "NHS-001",
        currency: "GBP",
        total: new Prisma.Decimal(15000),
        status: "approved",
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const inv2 = await prisma.customerInvoice.create({
      data: {
        tenantId,
        number: "INV-HC-002",
        customerId: "PRIVATE-001",
        currency: "GBP",
        total: new Prisma.Decimal(500),
        status: "approved",
        issuedAt: new Date(),
      },
    });

    await prisma.customerPayment.create({
      data: {
        tenantId,
        invoiceId: inv1.id,
        amount: new Prisma.Decimal(15000),
        method: "bank_transfer",
        reference: "NHS-PAY-001",
      },
    });

    await prisma.customerPayment.create({
      data: {
        tenantId,
        invoiceId: inv2.id,
        amount: new Prisma.Decimal(500),
        method: "card",
        reference: "PRIVATE-PAY-001",
      },
    });

    try {
      const event1: FinanceInvoiceCreated = {
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
      await publishWithOutbox(event1);

      const event2: FinanceInvoiceCreated = {
        id: newEventId(),
        tenantId,
        type: "finance.invoice.created",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: inv2.id,
          number: inv2.number,
          totalMinor: Number(inv2.total) * 100,
          currencyCode: inv2.currency,
          issuedAt: inv2.issuedAt.toISOString(),
        },
      };
      await publishWithOutbox(event2);
    } catch (error) {
      console.warn(`[Seed] Failed to publish invoice events:`, error);
    }

    console.log(`✅ Customer invoices: 2 created (NHS + Private), 2 payments`);
  }

  // Seed payroll (1-2 months)
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

      // Current month
      const run1 = await prisma.payrollRun.create({
        data: {
          tenantId,
          scheduleId: schedule.id,
          periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          status: "posted",
        },
      });

      // Previous month
      const run2 = await prisma.payrollRun.create({
        data: {
          tenantId,
          scheduleId: schedule.id,
          periodStart: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          periodEnd: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
          status: "posted",
        },
      });

      // Payslips for current month
      await prisma.payslip.createMany({
        data: [
          {
            tenantId,
            runId: run1.id,
            employeeId: employeeIds["EMP-HC-001"],
            grossPay: new Prisma.Decimal(8000),
            netPay: new Prisma.Decimal(6000),
          },
          {
            tenantId,
            runId: run1.id,
            employeeId: employeeIds["EMP-HC-002"],
            grossPay: new Prisma.Decimal(8000),
            netPay: new Prisma.Decimal(6000),
          },
          {
            tenantId,
            runId: run1.id,
            employeeId: employeeIds["EMP-HC-003"],
            grossPay: new Prisma.Decimal(3000),
            netPay: new Prisma.Decimal(2400),
          },
          {
            tenantId,
            runId: run1.id,
            employeeId: employeeIds["EMP-HC-004"],
            grossPay: new Prisma.Decimal(3000),
            netPay: new Prisma.Decimal(2400),
          },
          {
            tenantId,
            runId: run1.id,
            employeeId: employeeIds["EMP-HC-005"],
            grossPay: new Prisma.Decimal(2500),
            netPay: new Prisma.Decimal(2000),
          },
        ],
      });

      // Payslips for previous month
      await prisma.payslip.createMany({
        data: [
          {
            tenantId,
            runId: run2.id,
            employeeId: employeeIds["EMP-HC-001"],
            grossPay: new Prisma.Decimal(8000),
            netPay: new Prisma.Decimal(6000),
          },
          {
            tenantId,
            runId: run2.id,
            employeeId: employeeIds["EMP-HC-002"],
            grossPay: new Prisma.Decimal(8000),
            netPay: new Prisma.Decimal(6000),
          },
          {
            tenantId,
            runId: run2.id,
            employeeId: employeeIds["EMP-HC-003"],
            grossPay: new Prisma.Decimal(3000),
            netPay: new Prisma.Decimal(2400),
          },
          {
            tenantId,
            runId: run2.id,
            employeeId: employeeIds["EMP-HC-004"],
            grossPay: new Prisma.Decimal(3000),
            netPay: new Prisma.Decimal(2400),
          },
          {
            tenantId,
            runId: run2.id,
            employeeId: employeeIds["EMP-HC-005"],
            grossPay: new Prisma.Decimal(2500),
            netPay: new Prisma.Decimal(2000),
          },
        ],
      });

      console.log(`✅ Payroll: 2 runs (2 months), 10 payslips`);
    }
  }

  // Seed bank accounts
  await seedBankAccountsIfEmpty(prisma, tenantId, [
    { code: "BANK-HC-001", name: "GP Practice Account", currency: "GBP" },
  ]);

  // Seed KPI snapshots
  const kpiCount = await prisma.kpiSnapshot.count({ where: { tenantId } });
  if (kpiCount === 0) {
    await prisma.kpiSnapshot.createMany({
      data: [
        { tenantId, name: "revenue", value: new Prisma.Decimal(15500), asOf: new Date() },
        { tenantId, name: "nhs_contract_revenue", value: new Prisma.Decimal(15000), asOf: new Date() },
        { tenantId, name: "private_patient_revenue", value: new Prisma.Decimal(500), asOf: new Date() },
        { tenantId, name: "employees", value: new Prisma.Decimal(5), asOf: new Date() },
        { tenantId, name: "gps", value: new Prisma.Decimal(2), asOf: new Date() },
        { tenantId, name: "nurses", value: new Prisma.Decimal(2), asOf: new Date() },
      ],
    });
    console.log(`✅ KPI snapshots: 6 created`);
  }

  console.log(`✅ Healthcare scenario seed complete!`);
}

if (require.main === module) {
  runScenarioSeed("healthcare", seedHealthcareScenario).catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

