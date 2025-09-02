/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upsertBillingPlans() {
  const plans = [
    { code: 'free', name: 'Free', currency: 'GBP', unitPriceMinor: 0, isActive: true },
    { code: 'standard', name: 'Standard', currency: 'GBP', unitPriceMinor: 999, isActive: true },
    { code: 'professional', name: 'Professional', currency: 'GBP', unitPriceMinor: 2999, isActive: true },
    { code: 'enterprise', name: 'Enterprise', currency: 'GBP', unitPriceMinor: 9999, isActive: true },
  ]
  for (const plan of plans) {
    await prisma.billingPlan.upsert({
      where: { code: plan.code },
      update: { name: plan.name, currency: plan.currency, unitPriceMinor: plan.unitPriceMinor, isActive: plan.isActive },
      create: { id: undefined as unknown as string, ...plan },
    })
  }
}

async function ensureDemoSubscription() {
  const tenantId = 'demo-tenant'
  const plan = await prisma.billingPlan.findFirst({ where: { code: 'standard' } })
  if (!plan) return
  const existing = await prisma.subscription.findFirst({ where: { tenantId } })
  const now = new Date()
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  if (existing) {
    await prisma.subscription.update({ where: { id: existing.id }, data: { planId: plan.id, status: 'active', currentPeriodStart: now, currentPeriodEnd: end } })
  } else {
    await prisma.subscription.create({
      data: {
        tenantId,
        planId: plan.id,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: end,
        customerId: 'demo-customer',
      },
    })
  }
}

function lastQuarterPeriods(): Array<{ periodKey: string; start: Date; end: Date; due: Date }> {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0))
  const due = new Date(end.getTime() + 30 * 24 * 60 * 60 * 1000)
  return [
    { periodKey: '24A1', start, end, due },
  ]
}

async function seedVatReturns() {
  const vrn = process.env.HMRC_VRN
  if (!vrn) return
  for (const p of lastQuarterPeriods()) {
    const existing = await prisma.vatReturn.findFirst({ where: { vrn, periodKey: p.periodKey } })
    if (!existing) {
      await prisma.vatReturn.create({ data: { vrn, periodKey: p.periodKey, start: p.start, end: p.end, due: p.due, status: 'open' } })
    }
  }
}

async function ensureBankConnectionPlaceholder() {
  const existing = await prisma.bankConnection.findFirst({ where: { provider: 'truelayer' } })
  if (!existing) {
    await prisma.bankConnection.create({ data: { provider: 'truelayer', status: 'not_configured' } })
  }
}

async function main() {
  await upsertBillingPlans()
  await ensureDemoSubscription()
  await seedVatReturns()
  await ensureBankConnectionPlaceholder()
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('seed:phaseA done')
  })
  .catch(async (e) => {
    console.error('seed:phaseA error', e?.message || e)
    await prisma.$disconnect()
    process.exit(1)
  })


