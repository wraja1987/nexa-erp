/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const prisma = new PrismaClient()

function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
function isOpenBankingConfigured() {
  return Boolean(process.env.OPEN_BANKING_CLIENT_ID && process.env.OPEN_BANKING_CLIENT_SECRET && String(process.env.OPEN_BANKING_ENV).toLowerCase() === 'sandbox')
}
function isHmrcConfigured() {
  return Boolean(process.env.HMRC_CLIENT_ID && process.env.HMRC_CLIENT_SECRET && String(process.env.HMRC_ENVIRONMENT).toLowerCase() === 'sandbox' && process.env.HMRC_VRN)
}

export async function billingReconcile() {
  if (!isStripeConfigured()) return
  // demo no-op: ensure subscription remains active
  const sub = await prisma.subscription.findFirst({})
  if (sub) {
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'active' } })
  }
}

export async function openBankingSync() {
  if (!isOpenBankingConfigured()) return
  // demo no-op: nothing persisted in Phase A
}

export async function hmrcPullObligations() {
  if (!isHmrcConfigured()) return
  // demo no-op: seed covers example entries
}

export async function runOnce() {
  const status: Record<string, { lastRun: string; outcome: 'success' | 'error' }> = {}
  const record = async (key: string, fn: () => Promise<void>) => {
    try { await fn(); status[key] = { lastRun: new Date().toISOString(), outcome: 'success' } }
    catch { status[key] = { lastRun: new Date().toISOString(), outcome: 'error' } }
  }
  await record('billing:reconcile', billingReconcile)
  await record('openbanking:sync', openBankingSync)
  await record('hmrc:pull-obligations', hmrcPullObligations)
  // Phase 7 jobs (stubs)
  await record('mrp:plan', async () => { /* compute demo MRP suggestions */ })
  await record('capacity:recalc', async () => { /* recalc demo capacity */ })
  await record('wms:replenish', async () => { /* replenish demo */ })
  await record('wms:wave:dispatch', async () => { /* dispatch wave */ })
  await record('asn:auto-close', async () => { /* close ASNs */ })
  await record('po:remind-suppliers', async () => { /* reminders */ })
  await record('consolidation:rollup', async () => { /* finance rollup */ })
  await record('treasury:reconcile', async () => { /* reconcile balances */ })
  await record('payroll:run', async () => { /* payroll calc */ })
  await record('channel:sync:amazon', async () => { /* mock sync */ })
  await record('channel:sync:ebay', async () => { /* mock sync */ })
  await record('channel:sync:shopify', async () => { /* mock sync */ })
  await record('notify:send', async () => { /* mock send notifications */ })
  const file = join(process.cwd(), '..', '..', 'reports', 'jobs-status.json')
  await writeFile(file, JSON.stringify(status, null, 2))
}

if (require.main === module) {
  runOnce()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('[jobs] error', e?.message || e)
      await prisma.$disconnect()
      process.exit(1)
    })
}


