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
  const file = join(process.cwd(), '..', '..', 'reports', 'jobs-status.json')
  await writeFile(file, JSON.stringify(status, null, 2))
}

import { fileURLToPath } from 'url'
const isDirect = (() => {
  try {
    const thisFile = fileURLToPath(import.meta.url)
    return process.argv[1] && thisFile === process.argv[1]
  } catch {
    return false
  }
})()

if (isDirect) {
  runOnce()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('[jobs] error', e?.message || e)
      await prisma.$disconnect()
      process.exit(1)
    })
}


